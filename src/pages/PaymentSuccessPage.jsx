import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { FaCheckCircle, FaBoxOpen, FaListAlt } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PaymentSuccessPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const isCOD = searchParams.get('cod') === 'true';
    const [order, setOrder] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrder = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                const { data } = await axios.get(`/api/orders/${id}`, config);
                setOrder(data);
            } catch (error) {
                console.error('Error fetching order:', error);
            }
        };

        if (id) fetchOrder();
    }, [id, user, navigate]);

    return (
        <div className="payment-success-page text-center py-5">
            <div className="success-animation mb-4">
                <FaCheckCircle className="success-icon" />
            </div>

            <h1 className="mb-3" style={{ color: '#10b981', fontWeight: 800 }}>
                {isCOD ? 'Order Placed Successfully!' : 'Payment Successful!'}
            </h1>
            <p className="text-muted mb-1" style={{ fontSize: '1.15rem' }}>
                {isCOD
                    ? 'Your order has been placed. Please keep the cash ready for delivery.'
                    : 'Your payment has been processed and your order is confirmed.'}
            </p>
            <p className="text-muted mb-4" style={{ fontSize: '1rem' }}>
                Order ID: <strong>#{id}</strong>
            </p>

            {order && (
                <Card className="order-success-summary mx-auto mb-4" style={{ maxWidth: '500px' }}>
                    <Card.Body>
                        <Row className="text-start">
                            <Col xs={6} className="mb-3">
                                <small className="text-muted">Payment Method</small>
                                <p className="fw-bold mb-0">{order.paymentMethod}</p>
                            </Col>
                            <Col xs={6} className="mb-3">
                                <small className="text-muted">Total Amount</small>
                                <p className="fw-bold mb-0" style={{ color: '#ff6b35' }}>₹{order.totalPrice?.toFixed(2)}</p>
                            </Col>
                            <Col xs={6} className="mb-3">
                                <small className="text-muted">Items</small>
                                <p className="fw-bold mb-0">{order.orderItems?.length} product(s)</p>
                            </Col>
                            <Col xs={6} className="mb-3">
                                <small className="text-muted">Status</small>
                                <p className="fw-bold mb-0" style={{ color: '#10b981' }}>
                                    {order.isPaid ? 'Paid' : isCOD ? 'Pay on Delivery' : 'Processing'}
                                </p>
                            </Col>
                            <Col xs={12}>
                                <small className="text-muted">Shipping To</small>
                                <p className="fw-bold mb-0">
                                    {order.shippingAddress?.address}, {order.shippingAddress?.city},{' '}
                                    {order.shippingAddress?.postalCode}
                                </p>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Button
                    variant="primary"
                    size="lg"
                    className="success-btn"
                    onClick={() => navigate(`/order/${id}`)}
                    style={{ background: '#ff6b35', border: 'none', fontWeight: 700, padding: '0.75rem 2rem' }}
                >
                    <FaBoxOpen className="me-2" />
                    View Order Details
                </Button>
                <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={() => navigate('/myorders')}
                    style={{ fontWeight: 700, padding: '0.75rem 2rem' }}
                >
                    <FaListAlt className="me-2" />
                    Order History
                </Button>
            </div>

            <div className="mt-4">
                <Button variant="link" className="text-muted" onClick={() => navigate('/products')}>
                    Continue Shopping
                </Button>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
