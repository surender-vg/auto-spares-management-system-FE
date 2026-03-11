import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../constants/api';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrderPage = () => {
    const { cartItems, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [razorpayKey, setRazorpayKey] = useState('');

    const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress')) || {};
    const paymentMethod = localStorage.getItem('paymentMethod') || 'Razorpay';

    if (!shippingAddress.address) {
        navigate('/shipping');
    }

    // Calculate prices
    const addDecimals = (num) => {
        return (Math.round(num * 100) / 100).toFixed(2);
    };

    const itemsPrice = addDecimals(
        cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    );
    const shippingPrice = addDecimals(itemsPrice > 100 ? 0 : 100);
    const taxPrice = addDecimals(Number((0.15 * itemsPrice).toFixed(2)));
    const totalPrice = (
        Number(itemsPrice) +
        Number(shippingPrice) +
        Number(taxPrice)
    ).toFixed(2);

    useEffect(() => {
        if (!user) {
            navigate('/login');
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
    }, [user, navigate]);

    const placeOrderHandler = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
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
                toast.error('Cart item is missing product id. Please remove and re-add the item.');
                return;
            }

            // First create the order in our database
            const { data } = await axios.post(
                '/api/orders',
                {
                    orderItems: normalizedItems,
                    shippingAddress,
                    paymentMethod: paymentMethod,
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
                    {
                        amount: totalPrice,
                        currency: 'INR',
                        receipt: data._id,
                    },
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
                                // Verify payment on backend - pass both Razorpay order ID and MongoDB order ID
                                const verifyResponse = await axios.post(
                                    '/api/payment/razorpay/verify',
                                    {
                                        razorpay_order_id: response.razorpay_order_id, // Razorpay's order ID for signature verification
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_signature: response.razorpay_signature,
                                        mongo_order_id: data._id, // MongoDB order ID for database update
                                    },
                                    config
                                );
                                
                                if (verifyResponse.data.success) {
                                    toast.success('Payment Successful! Order marked as Paid');
                                    clearCart();
                                    navigate(`/order/${data._id}`);
                                } else {
                                    toast.error('Payment verification failed');
                                }
                            } catch (verifyError) {
                                toast.error('Payment verification failed: ' + (verifyError.response?.data?.message || verifyError.message));
                                console.error(verifyError);
                            }
                        },
                        prefill: {
                            name: user.name,
                            email: user.email,
                            contact: shippingAddress.phone || '',
                        },
                        theme: {
                            color: '#ff6b35',
                        },
                        modal: {
                            ondismiss: function () {
                                toast.info('Payment cancelled');
                            },
                        },
                    };

                    const razorpay = new window.Razorpay(options);
                    razorpay.open();
                };

                script.onerror = () => {
                    toast.error('Failed to load Razorpay SDK');
                };

                // Suppress external tracking errors that don't affect payment
                window.addEventListener('error', (event) => {
                    if (event.message && (
                        event.message.includes('lumberjack') ||
                        event.message.includes('sentry') ||
                        event.message.includes('x-rtb-fingerprint')
                    )) {
                        event.preventDefault();
                    }
                });
            } else {
                // For COD or other payment methods
                toast.success('Order Placed!');
                clearCart();
                navigate(`/order/${data._id}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    return (
        <Row>
            <Col md={8}>
                <ListGroup variant='flush'>
                    <ListGroup.Item>
                        <h2>Shipping</h2>
                        <p>
                            <strong>Address:</strong>
                            {shippingAddress.address}, {shippingAddress.city},{' '}
                            {shippingAddress.postalCode}, {shippingAddress.country}
                        </p>
                    </ListGroup.Item>

                    <ListGroup.Item>
                        <h2>Payment Method</h2>
                        <p>
                            <strong>Method:</strong> {paymentMethod}
                        </p>
                    </ListGroup.Item>

                    <ListGroup.Item>
                        <h2>Order Items</h2>
                        {cartItems.length === 0 ? (
                            <div className="alert alert-info">Your cart is empty</div>
                        ) : (
                            <ListGroup variant='flush'>
                                {cartItems.map((item, index) => (
                                    <ListGroup.Item key={index}>
                                        <Row>
                                            <Col md={1}>
                                                <Image
                                                    src={getImageUrl(item.image)}
                                                    alt={item.name}
                                                    fluid
                                                    rounded
                                                />
                                            </Col>
                                            <Col>
                                                <Link to={`/product/${item.product}`}>
                                                    {item.name}
                                                </Link>
                                            </Col>
                                            <Col md={4}>
                                                {item.qty} x ₹{item.price} = ₹{item.qty * item.price}
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </ListGroup.Item>
                </ListGroup>
            </Col>
            <Col md={4}>
                <Card>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>Order Summary</h2>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Row>
                                <Col>Items</Col>
                                <Col>₹{itemsPrice}</Col>
                            </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Row>
                                <Col>Shipping</Col>
                                <Col>₹{shippingPrice}</Col>
                            </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Row>
                                <Col>Tax</Col>
                                <Col>₹{taxPrice}</Col>
                            </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Row>
                                <Col>Total</Col>
                                <Col>₹{totalPrice}</Col>
                            </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Button
                                type='button'
                                className='btn-block'
                                disabled={cartItems.length === 0}
                                onClick={placeOrderHandler}
                            >
                                Place Order
                            </Button>
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
            </Col>
        </Row>
    );
};

export default PlaceOrderPage;
