import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    FaRupeeSign, FaShoppingCart, FaBox, FaUsers, FaClock,
    FaCheckCircle, FaArrowUp, FaArrowRight, FaEye,
    FaPlus, FaClipboardList, FaUsersCog, FaTruck
} from 'react-icons/fa';
import DashboardSidebar from '../components/DashboardSidebar';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalOrders: 0, totalRevenue: 0, totalProducts: 0,
        totalUsers: 0, pendingOrders: 0, recentOrders: [],
        orders: [], paidOrders: 0, averageOrderValue: 0,
    });
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!user || !user.token) { navigate('/login'); return; }
        if (user.role !== 'admin') { navigate('/'); return; }

        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const [ordersRes, productsRes, usersRes] = await Promise.all([
                    axios.get('/api/orders', config),
                    axios.get('/api/products'),
                    axios.get('/api/users', config),
                ]);
                const orders = ordersRes.data || [];
                const products = productsRes.data || [];
                const users = usersRes.data || [];
                const totalRevenue = orders.reduce((a, o) => a + Number(o.totalPrice || 0), 0);
                setStats({
                    totalOrders: orders.length,
                    totalRevenue,
                    totalProducts: products.length,
                    totalUsers: users.length,
                    pendingOrders: orders.filter(o => o.status === 'Processing').length,
                    recentOrders: orders.slice(0, 8),
                    orders,
                    paidOrders: orders.filter(o => o.isPaid).length,
                    averageOrderValue: orders.length ? totalRevenue / orders.length : 0,
                });
                setLoading(false);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error fetching dashboard data');
                setLoading(false);
            }
        };
        fetchData();
    }, [user, navigate]);

    const revenueChart = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const byMonth = Array(12).fill(0);
        (stats.orders || []).forEach(o => { byMonth[new Date(o.createdAt).getMonth()] += Number(o.totalPrice || 0); });
        return {
            labels: months,
            datasets: [{
                label: 'Revenue (₹)',
                data: byMonth,
                borderColor: '#ff6b35',
                backgroundColor: 'rgba(255,107,53,0.08)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ff6b35',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            }],
        };
    }, [stats.orders]);

    const statusChart = useMemo(() => ({
        labels: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
        datasets: [{
            data: [
                (stats.orders || []).filter(o => o.status === 'Processing').length,
                (stats.orders || []).filter(o => o.status === 'Shipped').length,
                (stats.orders || []).filter(o => o.status === 'Out for Delivery').length,
                (stats.orders || []).filter(o => o.status === 'Delivered').length,
                (stats.orders || []).filter(o => o.status === 'Cancelled').length,
            ],
            backgroundColor: ['#f59e0b', '#3b82f6', '#f97316', '#10b981', '#ef4444'],
            borderWidth: 0,
            cutout: '72%',
        }],
    }), [stats.orders]);

    const statusBadge = (status) => {
        const map = {
            'Processing': 'adm-badge-warning',
            'Shipped': 'adm-badge-info',
            'Out for Delivery': 'adm-badge-orange',
            'Delivered': 'adm-badge-success',
            'Cancelled': 'adm-badge-danger',
        };
        return map[status] || 'adm-badge-default';
    };

    if (loading) {
        return (
            <div className="adm-layout">
                <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />
                <main className="adm-main">
                    <div className="adm-loader">
                        <div className="adm-spinner" />
                        <p>Loading dashboard...</p>
                    </div>
                </main>
            </div>
        );
    }

    const kpiCards = [
        { label: 'Total Revenue', value: `₹${(stats.totalRevenue/1000).toFixed(1)}K`, icon: FaRupeeSign, color: '#ff6b35', bg: '#fff7f3' },
        { label: 'Total Orders', value: stats.totalOrders, icon: FaShoppingCart, color: '#3b82f6', bg: '#f0f6ff' },
        { label: 'Products', value: stats.totalProducts, icon: FaBox, color: '#10b981', bg: '#f0fdf4' },
        { label: 'Customers', value: stats.totalUsers, icon: FaUsers, color: '#8b5cf6', bg: '#f5f3ff' },
    ];

    return (
        <div className="adm-layout">
            <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />

            <main className="adm-main">
                {/* Header */}
                <div className="adm-page-header">
                    <div>
                        <h1 className="adm-page-title">Dashboard</h1>
                        <p className="adm-page-subtitle">Welcome back, {user?.name}. Here's your shop overview.</p>
                    </div>
                    <div className="adm-header-actions">
                        <button className="adm-btn adm-btn-primary" onClick={() => navigate('/admin/product/new')}>
                            <FaPlus /> Add Product
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="adm-kpi-grid">
                    {kpiCards.map((kpi, i) => {
                        const Icon = kpi.icon;
                        return (
                            <div className="adm-kpi-card" key={i}>
                                <div className="adm-kpi-icon" style={{ background: kpi.bg, color: kpi.color }}>
                                    <Icon />
                                </div>
                                <div className="adm-kpi-info">
                                    <span className="adm-kpi-label">{kpi.label}</span>
                                    <span className="adm-kpi-value">{kpi.value}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Secondary KPIs */}
                <div className="adm-secondary-kpis">
                    <div className="adm-mini-kpi">
                        <FaClock className="adm-mini-icon" style={{ color: '#f59e0b' }} />
                        <div>
                            <span className="adm-mini-value">{stats.pendingOrders}</span>
                            <span className="adm-mini-label">Processing</span>
                        </div>
                    </div>
                    <div className="adm-mini-kpi">
                        <FaCheckCircle className="adm-mini-icon" style={{ color: '#10b981' }} />
                        <div>
                            <span className="adm-mini-value">{stats.paidOrders}</span>
                            <span className="adm-mini-label">Paid Orders</span>
                        </div>
                    </div>
                    <div className="adm-mini-kpi">
                        <FaRupeeSign className="adm-mini-icon" style={{ color: '#3b82f6' }} />
                        <div>
                            <span className="adm-mini-value">₹{stats.averageOrderValue?.toFixed(0)}</span>
                            <span className="adm-mini-label">Avg. Order</span>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="adm-charts-row">
                    <div className="adm-card adm-chart-card-wide">
                        <div className="adm-card-header">
                            <h3>Revenue Overview</h3>
                            <span className="adm-card-badge">Monthly</span>
                        </div>
                        <div className="adm-card-body">
                            <Line data={revenueChart} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 12 } } },
                                    y: { grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af', font: { size: 12 }, callback: v => `₹${(v/1000).toFixed(0)}K` } }
                                }
                            }} />
                        </div>
                    </div>
                    <div className="adm-card adm-chart-card-small">
                        <div className="adm-card-header">
                            <h3>Order Status</h3>
                        </div>
                        <div className="adm-card-body adm-doughnut-wrap">
                            <div className="adm-doughnut-container">
                                <Doughnut data={statusChart} options={{
                                    responsive: true, maintainAspectRatio: true,
                                    plugins: { legend: { display: false } }
                                }} />
                                <div className="adm-doughnut-center">
                                    <span className="adm-doughnut-num">{stats.totalOrders}</span>
                                    <span className="adm-doughnut-sub">Total</span>
                                </div>
                            </div>
                            <div className="adm-doughnut-legend">
                                {['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map((s, i) => {
                                    const colors = ['#f59e0b', '#3b82f6', '#f97316', '#10b981', '#ef4444'];
                                    const count = (stats.orders || []).filter(o => o.status === s).length;
                                    return (
                                        <div key={s} className="adm-legend-row">
                                            <span className="adm-legend-dot" style={{ background: colors[i] }} />
                                            <span className="adm-legend-text">{s}</span>
                                            <span className="adm-legend-val">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="adm-quick-actions">
                    <button className="adm-quick-btn" onClick={() => navigate('/admin/product/new')}>
                        <FaPlus className="adm-qa-icon" /> Add Product
                    </button>
                    <button className="adm-quick-btn" onClick={() => navigate('/admin/productlist')}>
                        <FaBox className="adm-qa-icon" /> Manage Products
                    </button>
                    <button className="adm-quick-btn" onClick={() => navigate('/admin/orderlist')}>
                        <FaClipboardList className="adm-qa-icon" /> View Orders
                    </button>
                    <button className="adm-quick-btn" onClick={() => navigate('/admin/userlist')}>
                        <FaUsersCog className="adm-qa-icon" /> Manage Users
                    </button>
                </div>

                {/* Recent Orders */}
                <div className="adm-card">
                    <div className="adm-card-header">
                        <h3>Recent Orders</h3>
                        <Link to="/admin/orderlist" className="adm-view-all">
                            View All <FaArrowRight />
                        </Link>
                    </div>
                    <div className="adm-table-wrap">
                        <table className="adm-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map(order => (
                                    <tr key={order._id}>
                                        <td>
                                            <div className="adm-customer-cell">
                                                <div className="adm-customer-avatar">{(order.user?.name || 'N')[0].toUpperCase()}</div>
                                                <span>{order.user?.name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="adm-text-muted">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        <td className="adm-text-bold">₹{order.totalPrice.toFixed(2)}</td>
                                        <td><span className={`adm-badge ${statusBadge(order.status)}`}>{order.status}</span></td>
                                        <td>
                                            <span className={`adm-badge ${order.isPaid ? 'adm-badge-success' : 'adm-badge-danger'}`}>
                                                {order.isPaid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td>
                                            <Link to={`/order/${order._id}`} className="adm-icon-btn" title="View">
                                                <FaEye />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
