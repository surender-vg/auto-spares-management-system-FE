import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaBox } from 'react-icons/fa';
import DashboardSidebar from '../components/DashboardSidebar';
import { getImageUrl } from '../constants/api';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role === 'customer') {
            navigate('/login');
        } else {
            fetchProducts();
        }
    }, [user, navigate]);

    const fetchProducts = async () => {
        const { data } = await axios.get('/api/products');
        setProducts(data);
    };

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`/api/products/${id}`, config);
                toast.success('Product deleted');
                fetchProducts();
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    return (
        <div className="adm-layout">
            <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />
            <main className="adm-main">
                <div className="adm-page-header">
                    <div>
                        <h1 className="adm-page-title">Products</h1>
                        <p className="adm-page-subtitle">{products.length} product{products.length !== 1 ? 's' : ''} in catalog</p>
                    </div>
                    <div className="adm-header-actions">
                        <button className="adm-btn adm-btn-primary" onClick={() => navigate('/admin/product/new')}>
                            <FaPlus /> Add Product
                        </button>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="adm-empty">
                        <div className="adm-empty-icon"><FaBox /></div>
                        <h3>No Products Found</h3>
                        <p>Start by adding your first product.</p>
                        <button className="adm-btn adm-btn-primary" onClick={() => navigate('/admin/product/new')}>
                            <FaPlus /> Add Product
                        </button>
                    </div>
                ) : (
                    <div className="adm-card">
                        <div className="adm-table-wrap">
                            <table className="adm-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Category</th>
                                        <th>Brand</th>
                                        <th>Stock</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product._id}>
                                            <td>
                                                <div className="adm-product-cell">
                                                    <img
                                                        src={getImageUrl(product.image)}
                                                        alt={product.name}
                                                        className="adm-product-thumb"
                                                        onError={(e) => { e.target.src = '/placeholder.png'; }}
                                                    />
                                                    <span className="adm-product-name">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="adm-text-bold">₹{product.price}</td>
                                            <td><span className="adm-badge adm-badge-default">{product.category}</span></td>
                                            <td className="adm-text-muted">{product.brand}</td>
                                            <td>
                                                <span className={`adm-badge ${product.countInStock === 0 ? 'adm-badge-danger' : product.countInStock <= 5 ? 'adm-badge-warning' : 'adm-badge-success'}`}>
                                                    {product.countInStock === 0 ? 'Out of Stock' : `${product.countInStock} in stock`}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="adm-actions-cell">
                                                    <Link to={`/admin/product/${product._id}/edit`} className="adm-icon-btn adm-icon-btn-edit" title="Edit">
                                                        <FaEdit />
                                                    </Link>
                                                    <button className="adm-icon-btn adm-icon-btn-delete" onClick={() => deleteHandler(product._id)} title="Delete">
                                                        <FaTrash />
                                                    </button>
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

export default ProductListPage;
