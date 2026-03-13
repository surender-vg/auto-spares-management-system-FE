import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Row, Col, Card, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../constants/api';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaCheck, FaTimes, FaEye, FaBoxOpen, FaShoppingBag, FaClock, FaTruck, FaCreditCard, FaBan } from 'react-icons/fa';

const MyOrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('/api/orders/myorders', config);
                setOrders(data);
                setLoading(false);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error fetching orders');
                setLoading(false);
            }
        };
        if (user) fetchOrders();
    }, [user]);

    const cancelHandler = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            setCancellingId(orderId);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`/api/orders/${orderId}/cancel`, {}, config);
            setOrders((prev) => prev.map((o) => o._id === orderId ? data.order : o));
            toast.success('Order cancelled successfully');
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Error cancelling order';
            toast.error(msg);
        } finally {
            setCancellingId(null);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading your orders...</p>
            </div>
        );
    }

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Delivered': return { color: '#fff', bg: '#10b981', icon: <FaCheck /> };
            case 'Out for Delivery': return { color: '#fff', bg: '#f59e0b', icon: <FaTruck /> };
            case 'Shipped': return { color: '#fff', bg: '#3b82f6', icon: <FaTruck /> };
            case 'Cancelled': return { color: '#fff', bg: '#ef4444', icon: <FaTimes /> };
            case 'Processing': return { color: '#fff', bg: '#6366f1', icon: <FaClock /> };
            default: return { color: '#fff', bg: '#6366f1', icon: <FaClock /> };
        }
    };

    return (
        <div className="my-orders-page">
            {/* Page Header */}
            <div className="orders-page-header mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Order History</h2>
                    <p className="text-muted mb-0">Track and manage all your orders</p>
                </div>
                <div className="orders-stats">
                    <div className="stat-pill">
                        <FaBoxOpen className="me-1" />
                        {orders.length} Orders
                    </div>
                    <div className="stat-pill success">
                        <FaCheck className="me-1" />
                        {orders.filter(o => o.isDelivered).length} Delivered
                    </div>
                </div>
            </div>

            {orders.length === 0 ? (
                <Card className="empty-orders-card text-center py-5">
                    <Card.Body>
                        <FaShoppingBag size={60} className="text-muted mb-3" />
                        <h3 className="fw-bold">No Orders Yet</h3>
                        <p className="text-muted mb-4">You haven't placed any orders yet. Start shopping now!</p>
                        <Button onClick={() => navigate('/products')}
                            style={{ background: '#ff6b35', border: 'none', fontWeight: 700, padding: '0.75rem 2rem' }}>
                            Start Shopping
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => {
                        const statusConfig = getStatusConfig(order.status);
                        const itemCount = order.orderItems?.reduce((a, i) => a + i.qty, 0) || 0;
                        return (
                            <Card key={order._id} className="order-card mb-3">
                                <Card.Body className="p-0">
                                    {/* Order Card Header */}
                                    <div className="order-card-header">
                                        <div className="d-flex align-items-center gap-3 flex-wrap">
                                            <div>
                                                <small className="text-muted">Order ID</small>
                                                <p className="mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>#{order._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                            <div className="order-card-divider d-none d-sm-block"></div>
                                            <div>
                                                <small className="text-muted">Placed On</small>
                                                <p className="mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="order-card-divider d-none d-sm-block"></div>
                                            <div>
                                                <small className="text-muted">Total</small>
                                                <p className="mb-0 fw-bold" style={{ fontSize: '0.9rem', color: '#ff6b35' }}>
                                                    ₹{order.totalPrice.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className="order-card-status"
                                            style={{ background: statusConfig.bg, color: statusConfig.color, fontWeight: 700 }}>
                                            {statusConfig.icon} <span className="ms-1">{order.status || 'Processing'}</span>
                                        </Badge>
                                    </div>

                                    {/* Order Card Body */}
                                    <div className="order-card-body">
                                        <Row className="align-items-center">
                                            <Col sm={7}>
                                                <div className="order-card-items">
                                                    {order.orderItems?.slice(0, 3).map((item, i) => (
                                                        <div key={i} className="order-card-item">
                                                            <img src={getImageUrl(item.image)} alt={item.name} className="order-card-item-img" />
                                                            <div className="order-card-item-info">
                                                                <span className="order-card-item-name">{item.name}</span>
                                                                <small className="text-muted">Qty: {item.qty} × ₹{item.price}</small>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {order.orderItems?.length > 3 && (
                                                        <small className="text-muted ms-2">+{order.orderItems.length - 3} more item(s)</small>
                                                    )}
                                                </div>
                                            </Col>
                                            <Col sm={5}>
                                                <div className="order-card-meta">
                                                    <div className="order-meta-row">
                                                        <FaCreditCard className="me-2 text-muted" />
                                                        <span>{order.paymentMethod}</span>
                                                        {order.isPaid
                                                            ? <Badge bg="" className="ms-2" style={{ background: '#ecfdf5', color: '#10b981', fontSize: '0.7rem' }}>Paid</Badge>
                                                            : <Badge bg="" className="ms-2" style={{ background: '#fef2f2', color: '#ef4444', fontSize: '0.7rem' }}>Unpaid</Badge>}
                                                    </div>
                                                    <div className="order-meta-row">
                                                        <FaTruck className="me-2 text-muted" />
                                                        <span>{order.isDelivered
                                                            ? `Delivered ${new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                                                            : 'In Transit'}</span>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    {/* Order Card Footer */}
                                    <div className="order-card-footer">
                                        <small className="text-muted">{itemCount} item(s)</small>
                                        <div className="d-flex gap-2">
                                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => cancelHandler(order._id)}
                                                    disabled={cancellingId === order._id}
                                                >
                                                    <FaBan className="me-1" />
                                                    {cancellingId === order._id ? 'Cancelling...' : 'Cancel'}
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="order-view-btn"
                                                onClick={() => navigate(`/order/${order._id}`)}
                                            >
                                                <FaEye className="me-1" /> View Details
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;
