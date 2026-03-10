import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaAward, FaHeadset, FaTruck, FaShieldAlt } from 'react-icons/fa';

const AboutUsPage = () => {
    return (
        <>
            {/* Page Header */}
            <div className="page-header mb-5">
                <h1>About Us</h1>
                <p className="text-muted">Quality Auto Spare Parts & Professional Service</p>
            </div>

            {/* Company Overview */}
            <section className="mb-5">
                <Row>
                    <Col lg={8} className="mb-4">
                        <h2 className="section-title">Shree Selvanayagi Auto Spares</h2>
                        <p className="fs-5 text-muted mb-3">
                            With over 15 years of experience in the auto spare parts industry, Shree Selvanayagi Auto Spares 
                            has established itself as a trusted name for quality products and reliable service.
                        </p>
                        <p className="fs-5 text-muted mb-3">
                            Our mission is to provide authentic, high-quality spare parts for all bike models at competitive prices, 
                            ensuring our customers get the best value for their money.
                        </p>
                        <p className="fs-5 text-muted">
                            We work directly with leading manufacturers and suppliers to bring you genuine products with warranty support. 
                            Our knowledgeable team is always ready to assist you in finding the right spare parts for your bike.
                        </p>
                    </Col>
                    <Col lg={4}>
                        <Card className="company-stats">
                            <Card.Body>
                                <div className="stat-item mb-3">
                                    <h3 className="stat-number">15+</h3>
                                    <p className="stat-label">Years of Experience</p>
                                </div>
                                <hr />
                                <div className="stat-item mb-3">
                                    <h3 className="stat-number">5000+</h3>
                                    <p className="stat-label">Products in Stock</p>
                                </div>
                                <hr />
                                <div className="stat-item">
                                    <h3 className="stat-number">10000+</h3>
                                    <p className="stat-label">Happy Customers</p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </section>

            {/* Why Choose Us */}
            <section className="mb-5">
                <h2 className="section-title mb-4">Why Choose Us?</h2>
                <Row>
                    <Col md={6} lg={3} className="mb-4">
                        <Card className="feature-card h-100">
                            <Card.Body className="text-center">
                                <FaAward className="feature-icon mb-3" style={{ color: '#ff6b35', fontSize: '2.5rem' }} />
                                <h5>Genuine Products</h5>
                                <p className="text-muted">100% authentic spare parts from verified suppliers</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3} className="mb-4">
                        <Card className="feature-card h-100">
                            <Card.Body className="text-center">
                                <FaTruck className="feature-icon mb-3" style={{ color: '#3b82f6', fontSize: '2.5rem' }} />
                                <h5>Fast Delivery</h5>
                                <p className="text-muted">Quick shipping to your doorstep across the country</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3} className="mb-4">
                        <Card className="feature-card h-100">
                            <Card.Body className="text-center">
                                <FaHeadset className="feature-icon mb-3" style={{ color: '#10b981', fontSize: '2.5rem' }} />
                                <h5>Expert Support</h5>
                                <p className="text-muted">Professional guidance from experienced technicians</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3} className="mb-4">
                        <Card className="feature-card h-100">
                            <Card.Body className="text-center">
                                <FaShieldAlt className="feature-icon mb-3" style={{ color: '#f59e0b', fontSize: '2.5rem' }} />
                                <h5>Warranty Support</h5>
                                <p className="text-muted">Comprehensive warranty on all products</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </section>

            {/* Mission & Vision */}
            <section className="mb-5">
                <Row>
                    <Col md={6} className="mb-4">
                        <Card className="mission-card">
                            <Card.Body>
                                <h4 className="mb-3">Our Mission</h4>
                                <p className="text-muted">
                                    To be the most trusted provider of quality auto spare parts, offering competitive prices, 
                                    reliable products, and exceptional customer service to every client.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} className="mb-4">
                        <Card className="mission-card">
                            <Card.Body>
                                <h4 className="mb-3">Our Vision</h4>
                                <p className="text-muted">
                                    To become a leading online destination for auto spare parts, recognized for quality, 
                                    reliability, and customer satisfaction across India.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </section>
        </>
    );
};

export default AboutUsPage;
