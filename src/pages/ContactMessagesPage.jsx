import React, { useState, useEffect } from 'react';
import { FaReply, FaCheckCircle, FaEnvelope, FaEnvelopeOpen, FaPhone, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';

const ContactMessagesPage = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (user?.token) fetchMessages();
        else setLoading(false);
    }, [user]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/contact', {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setMessages(response.data);
        } catch (error) {
            toast.error('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (messageId) => {
        try {
            await axios.put(`/api/contact/${messageId}/read`, {}, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            fetchMessages();
            toast.success('Message marked as read');
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleOpenReplyModal = (message) => {
        setSelectedMessage(message);
        setReplyText(message.reply || '');
        setShowReplyModal(true);
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) { toast.error('Please enter a reply'); return; }
        try {
            setReplying(true);
            await axios.put(`/api/contact/${selectedMessage._id}/reply`,
                { reply: replyText },
                { headers: { Authorization: `Bearer ${user?.token}` } }
            );
            toast.success('Reply sent successfully');
            setShowReplyModal(false);
            setReplyText('');
            setSelectedMessage(null);
            fetchMessages();
        } catch (error) {
            toast.error('Failed to send reply');
        } finally {
            setReplying(false);
        }
    };

    if (!user?.token && !loading) {
        return (
            <div className="adm-layout">
                <main className="adm-main"><div className="adm-empty"><p>Please log in as admin to view messages.</p></div></main>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="adm-layout">
                <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />
                <main className="adm-main">
                    <div className="adm-loader"><div className="adm-spinner" /><p>Loading messages...</p></div>
                </main>
            </div>
        );
    }

    const unread = messages.filter(m => !m.isRead).length;
    const replied = messages.filter(m => m.isReplied).length;

    return (
        <div className="adm-layout">
            <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />
            <main className="adm-main">
                <div className="adm-page-header">
                    <div>
                        <h1 className="adm-page-title">Messages</h1>
                        <p className="adm-page-subtitle">Manage customer inquiries</p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="adm-msg-stats">
                    <div className="adm-msg-stat">
                        <FaEnvelope className="adm-msg-stat-icon" style={{ color: '#3b82f6' }} />
                        <div>
                            <span className="adm-msg-stat-val">{messages.length}</span>
                            <span className="adm-msg-stat-label">Total</span>
                        </div>
                    </div>
                    <div className="adm-msg-stat">
                        <FaEnvelopeOpen className="adm-msg-stat-icon" style={{ color: '#f59e0b' }} />
                        <div>
                            <span className="adm-msg-stat-val">{unread}</span>
                            <span className="adm-msg-stat-label">Unread</span>
                        </div>
                    </div>
                    <div className="adm-msg-stat">
                        <FaCheckCircle className="adm-msg-stat-icon" style={{ color: '#10b981' }} />
                        <div>
                            <span className="adm-msg-stat-val">{replied}</span>
                            <span className="adm-msg-stat-label">Replied</span>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {messages.length === 0 ? (
                    <div className="adm-empty">
                        <div className="adm-empty-icon">📭</div>
                        <h3>No Messages</h3>
                        <p>No customer messages yet.</p>
                    </div>
                ) : (
                    <div className="adm-msg-list">
                        {messages.map((msg) => (
                            <div key={msg._id} className={`adm-msg-card ${!msg.isRead ? 'adm-msg-unread' : ''}`}>
                                <div className="adm-msg-header">
                                    <div className="adm-msg-sender">
                                        <div className="adm-customer-avatar">{(msg.name || 'U')[0].toUpperCase()}</div>
                                        <div>
                                            <strong>{msg.name}</strong>
                                            <span className="adm-text-muted" style={{ display: 'block', fontSize: '0.82rem' }}>{msg.email}</span>
                                            {msg.phone && <span className="adm-text-muted" style={{ fontSize: '0.8rem' }}><FaPhone style={{ fontSize: '0.7rem' }} /> {msg.phone}</span>}
                                        </div>
                                    </div>
                                    <div className="adm-msg-meta">
                                        <span className="adm-text-muted" style={{ fontSize: '0.82rem' }}>{new Date(msg.createdAt).toLocaleString()}</span>
                                        <div className="adm-msg-badges">
                                            {!msg.isRead && <span className="adm-badge adm-badge-danger">New</span>}
                                            {msg.isReplied && <span className="adm-badge adm-badge-success"><FaCheckCircle /> Replied</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="adm-msg-subject">{msg.subject || 'No Subject'}</div>
                                <div className="adm-msg-body">{msg.message}</div>

                                {msg.isReplied && (
                                    <div className="adm-msg-reply-box">
                                        <strong><FaReply /> Your Reply:</strong>
                                        <p>{msg.reply}</p>
                                        <span className="adm-text-muted" style={{ fontSize: '0.8rem' }}>Sent on {new Date(msg.repliedAt).toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="adm-msg-actions">
                                    {!msg.isRead && (
                                        <button className="adm-btn adm-btn-outline" onClick={() => handleMarkAsRead(msg._id)}>
                                            Mark as Read
                                        </button>
                                    )}
                                    <button className="adm-btn adm-btn-primary" onClick={() => handleOpenReplyModal(msg)}>
                                        <FaReply /> {msg.isReplied ? 'Edit Reply' : 'Reply'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reply Modal */}
                {showReplyModal && (
                    <div className="adm-modal-overlay" onClick={() => setShowReplyModal(false)}>
                        <div className="adm-modal" onClick={e => e.stopPropagation()}>
                            <div className="adm-modal-header">
                                <h3>Reply to Message</h3>
                                <button className="adm-modal-close" onClick={() => setShowReplyModal(false)}><FaTimes /></button>
                            </div>
                            <div className="adm-modal-body">
                                {selectedMessage && (
                                    <>
                                        <div className="adm-modal-info">
                                            <p><strong>From:</strong> {selectedMessage.name} ({selectedMessage.email})</p>
                                            <p><strong>Subject:</strong> {selectedMessage.subject || 'No Subject'}</p>
                                            <p><strong>Message:</strong></p>
                                            <div className="adm-modal-quote">{selectedMessage.message}</div>
                                        </div>
                                        <label className="adm-label">Your Reply</label>
                                        <textarea className="adm-textarea" rows={6} value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your reply here..." />
                                        <span className="adm-text-muted" style={{ fontSize: '0.82rem' }}>
                                            This message will be sent to {selectedMessage.email}
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="adm-modal-footer">
                                <button className="adm-btn adm-btn-outline" onClick={() => setShowReplyModal(false)}>Cancel</button>
                                <button className="adm-btn adm-btn-primary" onClick={handleSendReply} disabled={replying}>
                                    {replying ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ContactMessagesPage;
