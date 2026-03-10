import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const ContactUsPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            // You can replace this with your actual API endpoint
            await axios.post('/api/contact', formData);
            toast.success('Message sent successfully! We will get back to you soon.');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (error) {
            toast.error('Failed to send message. Please try again later.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Page Header */}
            <div className="page-header mb-5">
                <h1>Contact Us</h1>
                <p className="text-muted">Get in touch with our team</p>
            </div>

            {/* Check Messages Alert */}
            <div className="mb-4">
                <div style={{ 
                    backgroundColor: '#e8f4f8', 
                    border: '1px solid #b3e5fc', 
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <strong>Want to check your message status?</strong>
                        <p className="text-muted mb-0 small">View replies to your messages and track their status</p>
                    </div>
                    <button 
                        onClick={() => window.location.href = '/my-messages'}
                        style={{
                            backgroundColor: '#ff6b35',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.3rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            marginLeft: '1rem'
                        }}
                    >
                        View My Messages
                    </button>
                </div>
            </div>

            <Row className="mb-5">
                {/* Contact Information */}
                <Col lg={6} className="mb-4">
                    <h3 className="section-title mb-4">Get In Touch</h3>
                    <p className="text-muted mb-4">
                        Have questions about our products or services? We'd love to hear from you. 
                        Contact us using the form or reach out through any of the channels below.
                    </p>

                    {/* Contact Info Cards */}
                    <Row className="mb-4">
                        <Col className="mb-3">
                            <Card className="contact-info-card">
                                <Card.Body>
                                    <FaPhone className="contact-icon" style={{ color: '#ff6b35' }} />
                                    <h6 className="mt-3 mb-1">Phone</h6>
                                    <p className="text-muted mb-0">
                                        <a href="tel:+919715560530" style={{ color: 'inherit', textDecoration: 'none' }}>
                                            +91 97155 60530
                                        </a>
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col className="mb-3">
                            <Card className="contact-info-card">
                                <Card.Body>
                                    <FaEnvelope className="contact-icon" style={{ color: '#3b82f6' }} />
                                    <h6 className="mt-3 mb-1">Email</h6>
                                    <p className="text-muted mb-0">
                                        <a href="mailto:selvanayagischml@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                                            selvanayagischml@gmail.com
                                        </a>
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col className="mb-3">
                            <Card className="contact-info-card">
                                <Card.Body>
                                    <FaMapMarkerAlt className="contact-icon" style={{ color: '#10b981' }} />
                                    <h6 className="mt-3 mb-1">Address</h6>
                                    <p className="text-muted mb-0">
                                        17, Kangeyam Road,<br />
                                        Near Ellai Mahaliyamman Kovil,<br />
                                        Chennimalai, Erode,<br />
                                        Tamilnadu 638051.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col className="mb-3">
                            <Card className="contact-info-card">
                                <Card.Body>
                                    <FaClock className="contact-icon" style={{ color: '#f59e0b' }} />
                                    <h6 className="mt-3 mb-1">Business Hours</h6>
                                    <p className="text-muted mb-0">
                                        Mon - Sat: 8:00 AM - 9:00 PM<br />
                                        Sunday: 8:00 AM - 2:00 PM
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>

                {/* Contact Form */}
                <Col lg={6}>
                    <Card className="form-card">
                        <Card.Header className="bg-light border-bottom">
                            <h5 className="mb-0">Send us a Message</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Email *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Phone Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 9876543210"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Subject</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="How can we help?"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">Message *</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Your message here..."
                                        required
                                    />
                                </Form.Group>

                                <Button
                                    type="submit"
                                    className="btn-primary w-100"
                                    disabled={loading}
                                    style={{ background: '#ff6b35', border: 'none' }}
                                >
                                    {loading ? 'Sending...' : 'Send Message'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* FAQ Section */}
            <section className="mt-5">
                <h3 className="section-title mb-4">Frequently Asked Questions</h3>
                <Row>
                    <Col lg={6} className="mb-4">
                        <Card className="faq-card">
                            <Card.Body>
                                <h6 className="mb-2">Do you offer warranty on products?</h6>
                                <p className="text-muted small mb-0">
                                    Yes! All our products come with manufacturer warranty. 
                                    Details vary by product type.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6} className="mb-4">
                        <Card className="faq-card">
                            <Card.Body>
                                <h6 className="mb-2">What is your delivery time?</h6>
                                <p className="text-muted small mb-0">
                                    We deliver within 2-5 business days for most locations. 
                                    Express delivery is available for premium members.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6} className="mb-4">
                        <Card className="faq-card">
                            <Card.Body>
                                <h6 className="mb-2">Can I return or exchange products?</h6>
                                <p className="text-muted small mb-0">
                                    Yes, we offer 30-day returns and exchanges on eligible products 
                                    in original condition.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6} className="mb-4">
                        <Card className="faq-card">
                            <Card.Body>
                                <h6 className="mb-2">Do you provide installation support?</h6>
                                <p className="text-muted small mb-0">
                                    We provide installation guidance and can recommend local mechanics 
                                    in your area.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </section>
        </>
    );
};

export default ContactUsPage;
