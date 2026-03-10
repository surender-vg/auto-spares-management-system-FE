import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Card, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
    FaArrowLeft, FaTruck, FaCreditCard, FaBoxOpen, FaCheckCircle,
    FaTimesCircle, FaClock, FaMapMarkerAlt, FaPhone, FaUser, FaEnvelope,
    FaShippingFast
} from 'react-icons/fa';

const ORDER_STAGES = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

const OrderPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`/api/orders/${id}`, config);
                setOrder(data);
                setLoading(false);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error fetching order');
                setLoading(false);
            }
        };
        if (user) fetchOrder();
    }, [id, user]);

    const deliverHandler = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`/api/orders/${id}/deliver`, {}, config);
            setOrder(data);
            toast.success('Order marked as delivered');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating order');
        }
    };

    const statusHandler = async (newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`/api/orders/${id}/status`, { status: newStatus }, config);
            setOrder(data);
            toast.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating order status');
        }
    };

    const payHandler = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`/api/orders/${id}/pay`, {}, config);
            setOrder(data);
            toast.success('Order marked as paid');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating order');
        }
    };

    if (loading) {
        return (
            <div className="order-loading text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-5">
                <FaBoxOpen size={60} className="text-muted mb-3" />
                <h3>Order Not Found</h3>
                <p className="text-muted">The order you're looking for doesn't exist.</p>
                <Button variant="primary" onClick={() => navigate('/myorders')}
                    style={{ background: '#ff6b35', border: 'none' }}>
                    View My Orders
                </Button>
            </div>
        );
    }

    const itemsTotal = order.orderItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return '#10b981';
            case 'Out for Delivery': return '#f59e0b';
            case 'Shipped': return '#3b82f6';
            case 'Processing': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const currentStageIdx = ORDER_STAGES.indexOf(order.status);

    const timelineSteps = [
        { label: 'Processing', done: currentStageIdx >= 0, date: order.createdAt, icon: <FaBoxOpen /> },
        { label: 'Shipped', done: currentStageIdx >= 1, date: currentStageIdx >= 1 ? null : null, icon: <FaShippingFast /> },
        { label: 'Out for Delivery', done: currentStageIdx >= 2, date: null, icon: <FaTruck /> },
        { label: 'Delivered', done: currentStageIdx >= 3, date: order.deliveredAt, icon: <FaCheckCircle /> },
    ];

    return (
        <div className="order-detail-page">
            {/* Header */}
            <div className="order-detail-header">
                <div className="d-flex align-items-center gap-3 mb-3">
                    <Button variant="light" className="order-back-btn" onClick={() => navigate('/myorders')}>
                        <FaArrowLeft />
                    </Button>
                    <div>
                        <h4 className="mb-0 fw-bold">Order Details</h4>
                        <small className="text-muted">#{order._id}</small>
                    </div>
                    <Badge className="ms-auto order-status-badge"
                        style={{ background: getStatusColor(order.status), fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                        {order.status || (order.isDelivered ? 'Delivered' : order.isPaid ? 'Confirmed' : 'Processing')}
                    </Badge>
                </div>

                {/* Order Timeline */}
                <div className="order-timeline">
                    {timelineSteps.map((step, i) => (
                        <React.Fragment key={i}>
                            <div className={`timeline-step ${step.done ? 'completed' : ''}`}>
                                <div className="timeline-icon">{step.icon}</div>
                                <span className="timeline-label">{step.label}</span>
                                {step.done && step.date && (
                                    <small className="timeline-date">
                                        {new Date(step.date).toLocaleDateString()}
                                    </small>
                                )}
                            </div>
                            {i < timelineSteps.length - 1 && (
                                <div className={`timeline-connector ${step.done ? 'completed' : ''}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <Row className="mt-4">
                {/* Left Column */}
                <Col lg={8}>
                    <Row className="g-3 mb-3">
                        <Col md={6}>
                            <Card className="order-info-card h-100">
                                <Card.Body>
                                    <div className="order-info-title">
                                        <FaTruck className="me-2" style={{ color: '#3b82f6' }} />
                                        Shipping Address
                                    </div>
                                    <div className="order-info-item">
                                        <FaMapMarkerAlt className="order-info-icon" />
                                        <span>{order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                                            {order.shippingAddress.postalCode}, {order.shippingAddress.country}</span>
                                    </div>
                                    {order.shippingAddress.phone && (
                                        <div className="order-info-item">
                                            <FaPhone className="order-info-icon" />
                                            <span>{order.shippingAddress.phone}</span>
                                        </div>
                                    )}
                                    <div className={`order-status-tag mt-3 ${order.isDelivered ? 'success' : 'warning'}`}>
                                        {order.isDelivered
                                            ? <><FaCheckCircle className="me-1" /> Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</>
                                            : <><FaClock className="me-1" /> Pending Delivery</>}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="order-info-card h-100">
                                <Card.Body>
                                    <div className="order-info-title">
                                        <FaCreditCard className="me-2" style={{ color: '#10b981' }} />
                                        Payment Details
                                    </div>
                                    <div className="order-info-item">
                                        <span className="fw-bold">Method:</span>
                                        <span className="ms-2">{order.paymentMethod}</span>
                                    </div>
                                    <div className="order-info-item">
                                        <FaUser className="order-info-icon" />
                                        <span>{order.user?.name}</span>
                                    </div>
                                    <div className="order-info-item">
                                        <FaEnvelope className="order-info-icon" />
                                        <a href={`mailto:${order.user?.email}`} className="text-decoration-none">
                                            {order.user?.email}
                                        </a>
                                    </div>
                                    <div className={`order-status-tag mt-3 ${order.isPaid ? 'success' : 'warning'}`}>
                                        {order.isPaid
                                            ? <><FaCheckCircle className="me-1" /> Paid on {new Date(order.paidAt).toLocaleDateString()}</>
                                            : <><FaClock className="me-1" /> Payment Pending</>}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Order Items */}
                    <Card className="order-items-card">
                        <Card.Header className="order-items-header">
                            <FaBoxOpen className="me-2" />
                            Order Items ({order.orderItems.length})
                        </Card.Header>
                        <Card.Body className="p-0">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="order-item-row">
                                    <Image src={item.image} alt={item.name} className="order-item-img" />
                                    <div className="order-item-details">
                                        <Link to={`/product/${item.product}`} className="order-item-name">
                                            {item.name}
                                        </Link>
                                        <span className="order-item-qty">Qty: {item.qty}</span>
                                    </div>
                                    <div className="order-item-price-col">
                                        <span className="order-item-unit">₹{item.price} × {item.qty}</span>
                                        <span className="order-item-total">₹{(item.qty * item.price).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column - Summary */}
                <Col lg={4}>
                    <Card className="order-summary-card sticky-top" style={{ top: '100px' }}>
                        <Card.Header className="order-summary-header">
                            Order Summary
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="order-summary-rows">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>₹{itemsTotal}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>{Number(order.shippingPrice) === 0
                                        ? <span className="text-success fw-bold">FREE</span>
                                        : `₹${order.shippingPrice.toFixed(2)}`}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax (GST)</span>
                                    <span>₹{order.taxPrice.toFixed(2)}</span>
                                </div>
                                <hr className="my-2" />
                                <div className="summary-row total">
                                    <strong>Total</strong>
                                    <strong style={{ color: '#ff6b35', fontSize: '1.3rem' }}>₹{order.totalPrice.toFixed(2)}</strong>
                                </div>
                            </div>

                            {/* Admin Actions */}
                            {user && (user.role === 'admin' || user.role === 'staff') && (
                                <div className="order-admin-actions">
                                    {!order.isPaid && (
                                        <Button className="w-100 mb-2 order-action-btn pay" onClick={payHandler}>
                                            <FaCreditCard className="me-2" /> Mark As Paid
                                        </Button>
                                    )}
                                    {order.status !== 'Delivered' && (
                                        <div className="status-progression">
                                            <p className="mb-2 fw-bold text-center" style={{ fontSize: '0.85rem', color: '#666' }}>
                                                Update Delivery Status
                                            </p>
                                            <div className="status-buttons-grid">
                                                {ORDER_STAGES.map((stage, idx) => {
                                                    const isActive = order.status === stage;
                                                    const isPast = ORDER_STAGES.indexOf(order.status) > idx;
                                                    return (
                                                        <Button
                                                            key={stage}
                                                            className={`status-progression-btn ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
                                                            onClick={() => statusHandler(stage)}
                                                            disabled={isActive}
                                                            size="sm"
                                                        >
                                                            {idx === 0 && <FaBoxOpen className="me-1" />}
                                                            {idx === 1 && <FaShippingFast className="me-1" />}
                                                            {idx === 2 && <FaTruck className="me-1" />}
                                                            {idx === 3 && <FaCheckCircle className="me-1" />}
                                                            {stage}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {order.status === 'Delivered' && (
                                        <div className="text-center p-2">
                                            <FaCheckCircle size={24} className="text-success mb-1" />
                                            <p className="mb-0 text-success fw-bold">Order Delivered</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    <div className="text-center mt-3">
                        <Button variant="link" className="text-muted" onClick={() => navigate('/myorders')}>
                            <FaArrowLeft className="me-1" /> Back to Order History
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default OrderPage;
