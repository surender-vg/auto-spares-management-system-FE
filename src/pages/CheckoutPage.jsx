import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Row, Col, Card, Form, Button, ListGroup, Image } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../constants/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTruck, FaCreditCard, FaMoneyBillWave, FaLock, FaArrowLeft } from 'react-icons/fa';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Shipping address state
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('India');
    const [phone, setPhone] = useState('');

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState('Razorpay');
    const [razorpayKey, setRazorpayKey] = useState('');
    const [placing, setPlacing] = useState(false);

    // Redirect if not logged in or cart is empty
    useEffect(() => {
        if (!user) {
            toast.info('Please login to continue checkout');
            navigate('/login');
            return;
        }
        if (cartItems.length === 0) {
            toast.info('Your cart is empty');
            navigate('/cart');
            return;
        }

        const fetchRazorpayKey = async () => {
            try {
                const { data } = await axios.get('/api/payment/razorpay/key');
                setRazorpayKey(data.key);
            } catch (error) {
                console.error('Error fetching Razorpay key:', error);
            }
        };
        fetchRazorpayKey();
    }, [user, cartItems, navigate]);

    // Load saved shipping address
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('shippingAddress') || '{}');
        if (saved.address) setAddress(saved.address);
        if (saved.city) setCity(saved.city);
        if (saved.postalCode) setPostalCode(saved.postalCode);
        if (saved.country) setCountry(saved.country);
        if (saved.phone) setPhone(saved.phone);
    }, []);

    // Price calculations
    const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);
    const itemsPrice = addDecimals(cartItems.reduce((acc, item) => acc + item.price * item.qty, 0));
    const shippingPrice = addDecimals(Number(itemsPrice) > 500 ? 0 : 50);
    const taxPrice = addDecimals(Number((0.18 * itemsPrice).toFixed(2)));
    const totalPrice = (Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice)).toFixed(2);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Validate shipping
        if (!address || !city || !postalCode || !country || !phone) {
            toast.error('Please fill in all shipping address fields');
            return;
        }

        setPlacing(true);

        const shippingAddress = { address, city, postalCode, country, phone };
        localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
        localStorage.setItem('paymentMethod', paymentMethod);

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };

            const normalizedItems = cartItems.map((item) => ({
                name: item.name,
                qty: Number(item.qty),
                image: item.image,
                price: Number(item.price),
                product: item.product || item._id || item.id,
            }));

            const missingProduct = normalizedItems.some((item) => !item.product);
            if (missingProduct) {
                toast.error('Cart item is missing product ID. Please remove and re-add the item.');
                setPlacing(false);
                return;
            }

            // Create order in database
            const { data } = await axios.post(
                '/api/orders',
                {
                    orderItems: normalizedItems,
                    shippingAddress,
                    paymentMethod,
                    itemsPrice,
                    shippingPrice,
                    taxPrice,
                    totalPrice,
                },
                config
            );

            if (paymentMethod === 'Razorpay') {
                // Create Razorpay order
                const razorpayOrder = await axios.post(
                    '/api/payment/razorpay/order',
                    { amount: totalPrice, currency: 'INR', receipt: data._id },
                    config
                );

                // Load Razorpay SDK
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                document.body.appendChild(script);

                script.onload = () => {
                    const options = {
                        key: razorpayKey,
                        amount: razorpayOrder.data.amount,
                        currency: razorpayOrder.data.currency,
                        name: 'Shree Selvanayagi Auto Spares',
                        description: `Order #${data._id}`,
                        order_id: razorpayOrder.data.id,
                        handler: async function (response) {
                            try {
                                const verifyResponse = await axios.post(
                                    '/api/payment/razorpay/verify',
                                    {
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_signature: response.razorpay_signature,
                                        mongo_order_id: data._id,
                                    },
                                    config
                                );

                                if (verifyResponse.data.success) {
                                    clearCart();
                                    navigate(`/payment-success/${data._id}`);
                                } else {
                                    toast.error('Payment verification failed');
                                    setPlacing(false);
                                }
                            } catch (verifyError) {
                                toast.error('Payment verification failed: ' + (verifyError.response?.data?.message || verifyError.message));
                                setPlacing(false);
                            }
                        },
                        prefill: {
                            name: user.name,
                            email: user.email,
                            contact: phone,
                        },
                        theme: { color: '#ff6b35' },
                        modal: {
                            ondismiss: function () {
                                toast.info('Payment cancelled');
                                setPlacing(false);
                            },
                        },
                    };
                    const razorpay = new window.Razorpay(options);
                    razorpay.open();
                };

                script.onerror = () => {
                    toast.error('Failed to load Razorpay SDK');
                    setPlacing(false);
                };
            } else {
                // Cash on Delivery
                clearCart();
                navigate(`/payment-success/${data._id}?cod=true`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            setPlacing(false);
        }
    };

    return (
        <div className="checkout-page">
            {/* Progress Steps */}
            <div className="checkout-progress mb-4">
                <div className="checkout-progress-step completed">
                    <div className="step-circle">1</div>
                    <span>Cart</span>
                </div>
                <div className="checkout-progress-line completed"></div>
                <div className="checkout-progress-step active">
                    <div className="step-circle">2</div>
                    <span>Checkout</span>
                </div>
                <div className="checkout-progress-line"></div>
                <div className="checkout-progress-step">
                    <div className="step-circle">3</div>
                    <span>Confirmation</span>
                </div>
            </div>

            <Form onSubmit={handlePlaceOrder}>
                <Row>
                    {/* Left Column - Shipping & Payment */}
                    <Col lg={8}>
                        {/* Shipping Address Card */}
                        <Card className="checkout-card mb-4">
                            <Card.Header className="checkout-card-header">
                                <FaTruck className="me-2" />
                                Shipping Address
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Row>
                                    <Col md={12} className="mb-3">
                                        <Form.Group controlId="address">
                                            <Form.Label className="fw-bold">Street Address *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                required
                                                placeholder="Enter your street address"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group controlId="city">
                                            <Form.Label className="fw-bold">City *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                required
                                                placeholder="Enter city"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group controlId="postalCode">
                                            <Form.Label className="fw-bold">Postal Code *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                required
                                                placeholder="Enter postal code"
                                                value={postalCode}
                                                onChange={(e) => setPostalCode(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group controlId="country">
                                            <Form.Label className="fw-bold">Country *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                required
                                                placeholder="Enter country"
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group controlId="phone">
                                            <Form.Label className="fw-bold">Phone Number *</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                required
                                                placeholder="Enter phone number"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Payment Method Card */}
                        <Card className="checkout-card mb-4">
                            <Card.Header className="checkout-card-header">
                                <FaCreditCard className="me-2" />
                                Payment Method
                            </Card.Header>
                            <Card.Body className="p-4">
                                <div className="payment-options">
                                    <div
                                        className={`payment-option ${paymentMethod === 'Razorpay' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('Razorpay')}
                                    >
                                        <Form.Check
                                            type="radio"
                                            id="razorpay"
                                            name="paymentMethod"
                                            value="Razorpay"
                                            checked={paymentMethod === 'Razorpay'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            label=""
                                        />
                                        <div className="payment-option-content">
                                            <FaCreditCard className="payment-option-icon" style={{ color: '#3b82f6' }} />
                                            <div>
                                                <strong>Razorpay</strong>
                                                <p className="text-muted mb-0">UPI, Credit/Debit Cards, Netbanking, Wallets</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={`payment-option ${paymentMethod === 'Cash on Delivery' ? 'selected' : ''}`}
                                        onClick={() => setPaymentMethod('Cash on Delivery')}
                                    >
                                        <Form.Check
                                            type="radio"
                                            id="cod"
                                            name="paymentMethod"
                                            value="Cash on Delivery"
                                            checked={paymentMethod === 'Cash on Delivery'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            label=""
                                        />
                                        <div className="payment-option-content">
                                            <FaMoneyBillWave className="payment-option-icon" style={{ color: '#10b981' }} />
                                            <div>
                                                <strong>Cash on Delivery</strong>
                                                <p className="text-muted mb-0">Pay when your order arrives at your doorstep</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right Column - Order Summary */}
                    <Col lg={4}>
                        <Card className="checkout-summary-card sticky-top" style={{ top: '100px' }}>
                            <Card.Header className="checkout-card-header">
                                Order Summary
                            </Card.Header>
                            <Card.Body className="p-0">
                                {/* Cart Items */}
                                <div className="checkout-items">
                                    {cartItems.map((item) => (
                                        <div key={item.product} className="checkout-item">
                                            <Image
                                                src={getImageUrl(item.image)}
                                                alt={item.name}
                                                fluid
                                                rounded
                                                className="checkout-item-img"
                                            />
                                            <div className="checkout-item-details">
                                                <Link to={`/product/${item.product}`} className="checkout-item-name">
                                                    {item.name}
                                                </Link>
                                                <span className="text-muted">Qty: {item.qty}</span>
                                            </div>
                                            <span className="checkout-item-price">₹{(item.price * item.qty).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Price Breakdown */}
                                <div className="checkout-price-breakdown">
                                    <div className="price-row">
                                        <span>Items ({cartItems.reduce((a, i) => a + i.qty, 0)})</span>
                                        <span>₹{itemsPrice}</span>
                                    </div>
                                    <div className="price-row">
                                        <span>Shipping</span>
                                        <span>{Number(shippingPrice) === 0 ? <span className="text-success fw-bold">FREE</span> : `₹${shippingPrice}`}</span>
                                    </div>
                                    <div className="price-row">
                                        <span>Tax (GST 18%)</span>
                                        <span>₹{taxPrice}</span>
                                    </div>
                                    <hr />
                                    <div className="price-row total">
                                        <strong>Total</strong>
                                        <strong>₹{totalPrice}</strong>
                                    </div>
                                </div>

                                {/* Place Order Button */}
                                <div className="p-3">
                                    <Button
                                        type="submit"
                                        className="w-100 checkout-place-order-btn"
                                        disabled={placing || cartItems.length === 0}
                                    >
                                        <FaLock className="me-2" />
                                        {placing ? 'Processing...' : paymentMethod === 'Cash on Delivery' ? 'Place Order (COD)' : 'Pay & Place Order'}
                                    </Button>
                                    <div className="text-center mt-2">
                                        <small className="text-muted">
                                            <FaLock size={10} className="me-1" />
                                            Your payment information is secure
                                        </small>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        <div className="text-center mt-3">
                            <Button variant="link" className="text-muted" onClick={() => navigate('/cart')}>
                                <FaArrowLeft className="me-1" /> Back to Cart
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default CheckoutPage;
