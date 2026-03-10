import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaCheck, FaTimes, FaEye, FaCheckCircle, FaFilter } from 'react-icons/fa';
import DashboardSidebar from '../components/DashboardSidebar';

const ORDER_STAGES = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const OrderListPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('/api/orders', config);
                setOrders(data);
                setLoading(false);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error fetching orders');
                setLoading(false);
            }
        };
        if (user && (user.role === 'admin' || user.role === 'staff')) fetchOrders();
    }, [user]);

    const statusHandler = async (orderId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`/api/orders/${orderId}/status`, { status: newStatus }, config);
            toast.success(`Order status updated to ${newStatus}`);
            setOrders(orders.map(order => order._id === orderId ? data : order));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating order status');
        }
    };

    const filteredOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .filter(order => {
            if (filter === 'all') return true;
            if (filter === 'processing') return order.status === 'Processing';
            if (filter === 'shipped') return order.status === 'Shipped';
            if (filter === 'outfordelivery') return order.status === 'Out for Delivery';
            if (filter === 'delivered') return order.status === 'Delivered';
            if (filter === 'cancelled') return order.status === 'Cancelled';
            return true;
        });

    const statusBadge = (status) => {
        const map = {
            'Processing': 'adm-badge-warning', 'Shipped': 'adm-badge-info',
            'Out for Delivery': 'adm-badge-orange', 'Delivered': 'adm-badge-success',
            'Cancelled': 'adm-badge-danger',
        };
        return map[status] || 'adm-badge-default';
    };

    if (loading) {
        return (
            <div className="adm-layout">
                <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />
                <main className="adm-main">
                    <div className="adm-loader"><div className="adm-spinner" /><p>Loading orders...</p></div>
                </main>
            </div>
        );
    }

    return (
        <div className="adm-layout">
            <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />
            <main className="adm-main">
                <div className="adm-page-header">
                    <div>
                        <h1 className="adm-page-title">Orders</h1>
                        <p className="adm-page-subtitle">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found</p>
                    </div>
                    <div className="adm-header-actions">
                        <div className="adm-filter-wrap">
                            <FaFilter className="adm-filter-icon" />
                            <select className="adm-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                                <option value="all">All Orders</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="outfordelivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="adm-empty">
                        <div className="adm-empty-icon">📦</div>
                        <h3>No Orders Found</h3>
                        <p>No orders match the current filter.</p>
                    </div>
                ) : (
                    <div className="adm-card">
                        <div className="adm-table-wrap">
                            <table className="adm-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Total</th>
                                        <th>Payment</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr key={order._id}>
                                            <td>
                                                <div className="adm-customer-cell">
                                                    <div className="adm-customer-avatar">{(order.user?.name || 'N')[0].toUpperCase()}</div>
                                                    <span>{order.user?.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="adm-text-muted">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td className="adm-text-bold">₹{order.totalPrice.toFixed(2)}</td>
                                            <td>
                                                {order.isPaid ? (
                                                    <span className="adm-badge adm-badge-success"><FaCheck /> Paid</span>
                                                ) : (
                                                    <span className="adm-badge adm-badge-danger"><FaTimes /> Unpaid</span>
                                                )}
                                            </td>
                                            <td><span className={`adm-badge ${statusBadge(order.status)}`}>{order.status}</span></td>
                                            <td>
                                                <div className="adm-actions-cell">
                                                    <Link to={`/order/${order._id}`} className="adm-icon-btn" title="View">
                                                        <FaEye />
                                                    </Link>
                                                    {order.status !== 'Delivered' && order.status !== 'Cancelled' ? (
                                                        <select className="adm-status-select" value={order.status}
                                                            onChange={(e) => statusHandler(order._id, e.target.value)}>
                                                            {ORDER_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    ) : order.status === 'Delivered' ? (
                                                        <span className="adm-badge adm-badge-success"><FaCheckCircle /> Done</span>
                                                    ) : (
                                                        <span className="adm-badge adm-badge-danger"><FaTimes /> Cancelled</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrderListPage;
