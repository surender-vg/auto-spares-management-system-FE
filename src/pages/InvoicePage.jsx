import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaPrint, FaArrowLeft } from 'react-icons/fa';

const InvoicePage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const printRef = useRef();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`/api/orders/${id}`, config);
                setOrder(data);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error fetching order');
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchOrder();
    }, [id, user]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3 text-muted">Loading invoice...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-5">
                <h3>Order not found</h3>
                <Button onClick={() => navigate('/myorders')}>Back to Orders</Button>
            </div>
        );
    }

    const subtotal = order.orderItems.reduce((acc, item) => acc + item.qty * item.price, 0);
    const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
    const invoiceNo = `INV-${order._id.slice(-8).toUpperCase()}`;

    return (
        <>
            {/* Action bar — hidden on print */}
            <div className="d-flex gap-2 mb-4 no-print">
                <Button variant="outline-secondary" onClick={() => user?.role === 'admin' ? navigate('/admin/orderlist') : navigate(`/order/${id}`)}>
                    <FaArrowLeft className="me-2" /> {user?.role === 'admin' ? 'Back to Dashboard' : 'Back to Order'}
                </Button>
                <Button
                    onClick={handlePrint}
                    style={{ background: '#ff6b35', border: 'none', fontWeight: 600 }}
                >
                    <FaPrint className="me-2" /> Print / Save as PDF
                </Button>
            </div>

            {/* ─────────────── INVOICE ─────────────── */}
            <div ref={printRef} style={styles.page}>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.logoBlock}>
                        <img src="/logo.png" alt="Shree Selvanayagi Auto Spares" style={styles.logoImg} />
                    </div>
                    <div style={styles.companyBlock}>
                        <h2 style={styles.companyName}>SHREE SELVANAYAGI AUTO SPARES</h2>
                        <p style={styles.companyDetail}>17, Kangeyam Road, Near Ellai Mahaliyamman Kovil,</p>
                        <p style={styles.companyDetail}>Chennimalai, Erode, Tamil Nadu – 638051</p>
                        <p style={styles.companyDetail}>📞 +91 97155 60530 &nbsp;|&nbsp; ✉ selvanayagischml@gmail.com</p>
                        <p style={styles.companyDetail}>GST No: <strong>33DLGPS0209P1ZU</strong></p>
                    </div>
                </div>

                <div style={styles.divider} />

                {/* Invoice Title & Meta */}
                <div style={styles.metaRow}>
                    <div>
                        <h3 style={styles.invoiceTitle}>TAX INVOICE</h3>
                        <p style={styles.metaText}><strong>Invoice No:</strong> {invoiceNo}</p>
                        <p style={styles.metaText}><strong>Date:</strong> {invoiceDate}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={styles.metaText}><strong>Order ID:</strong> #{order._id.slice(-8).toUpperCase()}</p>
                        <p style={styles.metaText}><strong>Payment:</strong> {order.paymentMethod}</p>
                        <span style={{
                            ...styles.statusBadge,
                            background: order.status === 'Delivered' ? '#10b981'
                                : order.status === 'Cancelled' ? '#ef4444'
                                : order.status === 'Shipped' ? '#3b82f6'
                                : '#6366f1'
                        }}>
                            {order.status || 'Processing'}
                        </span>
                    </div>
                </div>

                {/* Bill To */}
                <div style={styles.billToBox}>
                    <h5 style={styles.sectionLabel}>BILL TO</h5>
                    <p style={styles.billText}><strong>{order.user?.name || 'Customer'}</strong></p>
                    <p style={styles.billText}>{order.user?.email}</p>
                    <p style={styles.billText}>
                        {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                        {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                    </p>
                    {order.shippingAddress.phone && (
                        <p style={styles.billText}>Phone: {order.shippingAddress.phone}</p>
                    )}
                </div>

                {/* Items Table */}
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHead}>
                            <th style={{ ...styles.th, width: '5%' }}>#</th>
                            <th style={{ ...styles.th, width: '45%' }}>Item Description</th>
                            <th style={{ ...styles.th, width: '15%', textAlign: 'center' }}>Qty</th>
                            <th style={{ ...styles.th, width: '17%', textAlign: 'right' }}>Unit Price</th>
                            <th style={{ ...styles.th, width: '18%', textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.orderItems.map((item, idx) => (
                            <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                                <td style={styles.td}>{idx + 1}</td>
                                <td style={styles.td}>{item.name}</td>
                                <td style={{ ...styles.td, textAlign: 'center' }}>{item.qty}</td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                                <td style={{ ...styles.td, textAlign: 'right' }}>₹{(item.qty * item.price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div style={styles.totalsWrapper}>
                    <div style={styles.totalsBox}>
                        <div style={styles.totalRow}>
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div style={styles.totalRow}>
                            <span>Shipping</span>
                            <span>{Number(order.shippingPrice) === 0 ? 'FREE' : `₹${Number(order.shippingPrice).toFixed(2)}`}</span>
                        </div>
                        <div style={styles.totalRow}>
                            <span>GST (18%)</span>
                            <span>₹{Number(order.taxPrice).toFixed(2)}</span>
                        </div>
                        <div style={styles.dividerThin} />
                        <div style={styles.grandTotal}>
                            <strong>GRAND TOTAL</strong>
                            <strong style={{ color: '#ff6b35', fontSize: '1.2rem' }}>₹{Number(order.totalPrice).toFixed(2)}</strong>
                        </div>
                    </div>
                </div>

                {/* Payment Status */}
                <div style={styles.paymentStatus}>
                    {order.isPaid ? (
                        <span style={styles.paidBadge}>✔ PAID{order.paidAt ? ` on ${new Date(order.paidAt).toLocaleDateString('en-IN')}` : ''}</span>
                    ) : (
                        <span style={styles.unpaidBadge}>⏳ PAYMENT PENDING</span>
                    )}
                </div>

                {/* Footer */}
                <div style={styles.divider} />
                <div style={styles.footer}>
                    <p style={styles.footerText}>Thank you for shopping with <strong>Shree Selvanayagi Auto Spares</strong>!</p>
                    <p style={styles.footerText}>For queries, contact: <strong>+91 97155 60530</strong> | selvanayagischml@gmail.com</p>
                    <p style={{ ...styles.footerText, color: '#aaa', marginTop: 4 }}>This is a computer-generated invoice and does not require a physical signature.</p>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    nav, header, footer, .chat-bot { display: none !important; }
                    body { background: white !important; }
                }
            `}</style>
        </>
    );
};

const styles = {
    page: {
        maxWidth: 820,
        margin: '0 auto',
        background: '#fff',
        padding: '40px 48px',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: 14,
        color: '#222',
        boxShadow: '0 2px 24px rgba(0,0,0,0.10)',
        borderRadius: 8,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        marginBottom: 16,
    },
    logoBlock: {
        flexShrink: 0,
    },
    logoImg: {
        width: 90,
        height: 90,
        objectFit: 'contain',
        borderRadius: '50%',
    },
    companyBlock: {
        flex: 1,
    },
    companyName: {
        fontSize: 20,
        fontWeight: 800,
        color: '#1a1a2e',
        margin: '0 0 4px',
        letterSpacing: 0.5,
    },
    companyDetail: {
        margin: '1px 0',
        fontSize: 13,
        color: '#555',
    },
    divider: {
        borderTop: '2px solid #ff6b35',
        margin: '14px 0',
    },
    dividerThin: {
        borderTop: '1px solid #e5e7eb',
        margin: '8px 0',
    },
    metaRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        margin: '16px 0',
    },
    invoiceTitle: {
        fontSize: 22,
        fontWeight: 800,
        color: '#1a1a2e',
        marginBottom: 6,
        letterSpacing: 1,
    },
    metaText: {
        margin: '2px 0',
        fontSize: 13,
        color: '#444',
    },
    statusBadge: {
        display: 'inline-block',
        padding: '4px 14px',
        borderRadius: 20,
        color: '#fff',
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: 0.5,
        marginTop: 6,
    },
    billToBox: {
        background: '#f8f9fa',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        padding: '14px 18px',
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: 700,
        color: '#ff6b35',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    billText: {
        margin: '2px 0',
        fontSize: 13,
        color: '#333',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: 0,
    },
    tableHead: {
        background: '#1a1a2e',
    },
    th: {
        padding: '10px 12px',
        color: '#fff',
        fontWeight: 700,
        fontSize: 13,
        textAlign: 'left',
        letterSpacing: 0.3,
    },
    td: {
        padding: '10px 12px',
        fontSize: 13,
        color: '#333',
        borderBottom: '1px solid #f0f0f0',
    },
    trEven: {
        background: '#fff',
    },
    trOdd: {
        background: '#fafafa',
    },
    totalsWrapper: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: 0,
    },
    totalsBox: {
        width: 280,
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        padding: '14px 18px',
        marginTop: 8,
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 13,
        color: '#555',
        marginBottom: 6,
    },
    grandTotal: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 15,
        color: '#1a1a2e',
        marginTop: 4,
    },
    paymentStatus: {
        textAlign: 'center',
        margin: '18px 0 4px',
    },
    paidBadge: {
        background: '#ecfdf5',
        color: '#10b981',
        border: '1px solid #10b981',
        borderRadius: 20,
        padding: '5px 20px',
        fontWeight: 700,
        fontSize: 13,
    },
    unpaidBadge: {
        background: '#fff7ed',
        color: '#f59e0b',
        border: '1px solid #f59e0b',
        borderRadius: 20,
        padding: '5px 20px',
        fontWeight: 700,
        fontSize: 13,
    },
    footer: {
        textAlign: 'center',
        marginTop: 16,
    },
    footerText: {
        margin: '3px 0',
        fontSize: 12,
        color: '#666',
    },
};

export default InvoicePage;
