import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaChartLine, FaBox, FaClipboardList, FaUsers, FaEnvelopeOpenText,
    FaCog, FaTimes, FaBars, FaSignOutAlt, FaHome
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FaChartLine },
    { path: '/admin/productlist', label: 'Products', icon: FaBox },
    { path: '/admin/orderlist', label: 'Orders', icon: FaClipboardList },
    { path: '/admin/userlist', label: 'Customers', icon: FaUsers, adminOnly: true },
    { path: '/admin/messages', label: 'Messages', icon: FaEnvelopeOpenText, adminOnly: true },
];

const DashboardSidebar = ({ sidebarOpen, setSidebarOpen, user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <div
                className={`adm-sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />
            <aside className={`adm-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                {/* Brand */}
                <div className="adm-sidebar-brand">
                    <div className="adm-brand-logo" onClick={() => navigate('/admin/dashboard')}>
                        <span className="adm-brand-icon">S</span>
                        <span className="adm-brand-text">SpareAdmin</span>
                    </div>
                    <button className="adm-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                {/* Nav */}
                <nav className="adm-sidebar-nav">
                    <div className="adm-nav-group">
                        <span className="adm-nav-group-title">MAIN MENU</span>
                        {navItems.filter(i => !i.adminOnly || user?.role === 'admin').map(item => {
                            const Icon = item.icon;
                            const active = location.pathname === item.path;
                            return (
                                <button
                                    key={item.path}
                                    className={`adm-nav-item ${active ? 'active' : ''}`}
                                    onClick={() => { navigate(item.path); if (window.innerWidth < 992) setSidebarOpen(false); }}
                                >
                                    <span className="adm-nav-icon"><Icon /></span>
                                    <span className="adm-nav-label">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="adm-nav-group">
                        <span className="adm-nav-group-title">OTHER</span>
                        <button className="adm-nav-item" onClick={() => navigate('/')}>
                            <span className="adm-nav-icon"><FaHome /></span>
                            <span className="adm-nav-label">Storefront</span>
                        </button>
                        <button className={`adm-nav-item ${location.pathname === '/profile' ? 'active' : ''}`} onClick={() => navigate('/profile')}>
                            <span className="adm-nav-icon"><FaCog /></span>
                            <span className="adm-nav-label">Settings</span>
                        </button>
                    </div>
                </nav>

                {/* Footer */}
                <div className="adm-sidebar-footer">
                    <div className="adm-user-block">
                        <div className="adm-user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                        <div className="adm-user-meta">
                            <span className="adm-user-name">{user?.name}</span>
                            <span className="adm-user-role">{user?.role}</span>
                        </div>
                        <button className="adm-logout-btn" onClick={handleLogout} title="Logout">
                            <FaSignOutAlt />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;
