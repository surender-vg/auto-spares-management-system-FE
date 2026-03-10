import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaUserShield, FaUserTie, FaUser } from 'react-icons/fa';
import DashboardSidebar from '../components/DashboardSidebar';

const UserListPage = () => {
    const [users, setUsers] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
        } else {
            fetchUsers();
        }
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/users', config);
            setUsers(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error fetching users');
        }
    };

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`/api/users/${id}`, config);
                toast.success('User deleted');
                fetchUsers();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error deleting user');
            }
        }
    };

    const roleBadge = (role) => {
        const map = {
            admin: { cls: 'adm-badge-danger', icon: <FaUserShield /> },
            staff: { cls: 'adm-badge-warning', icon: <FaUserTie /> },
            customer: { cls: 'adm-badge-default', icon: <FaUser /> },
        };
        return map[role] || map.customer;
    };

    return (
        <div className="adm-layout">
            <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />
            <main className="adm-main">
                <div className="adm-page-header">
                    <div>
                        <h1 className="adm-page-title">Users</h1>
                        <p className="adm-page-subtitle">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {users.length === 0 ? (
                    <div className="adm-empty">
                        <div className="adm-empty-icon">👥</div>
                        <h3>No Users Found</h3>
                    </div>
                ) : (
                    <div className="adm-card">
                        <div className="adm-table-wrap">
                            <table className="adm-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => {
                                        const rb = roleBadge(u.role);
                                        return (
                                            <tr key={u._id}>
                                                <td>
                                                    <div className="adm-customer-cell">
                                                        <div className="adm-customer-avatar">{u.name[0].toUpperCase()}</div>
                                                        <span>{u.name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <a href={`mailto:${u.email}`} className="adm-email-link">{u.email}</a>
                                                </td>
                                                <td>
                                                    <span className={`adm-badge ${rb.cls}`}>{rb.icon} {u.role}</span>
                                                </td>
                                                <td>
                                                    <div className="adm-actions-cell">
                                                        <Link to={`/admin/user/${u._id}/edit`} className="adm-icon-btn adm-icon-btn-edit" title="Edit">
                                                            <FaEdit />
                                                        </Link>
                                                        <button className="adm-icon-btn adm-icon-btn-delete"
                                                            onClick={() => deleteHandler(u._id)}
                                                            disabled={u._id === user._id}
                                                            title="Delete">
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserListPage;
