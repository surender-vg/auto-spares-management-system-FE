import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Product from '../components/Product';
import axios from 'axios';
import { FaBox, FaTruck, FaHeadset, FaShieldAlt, FaArrowRight } from 'react-icons/fa';

const HomePage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('/api/products');
                setProducts(data.slice(0, 8)); // Show first 8 products
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <>
            {/* Hero Section */}
            <section className="hero-section mb-5">
                <div className="hero-content">
                    <h1 className="hero-title">Premium Auto Spare Parts</h1>
                    <p className="hero-subtitle">Quality auto spare parts for all bike models at competitive prices</p>
                    <div className="hero-buttons">
                        <Button 
                            size="lg" 
                            className="btn-primary"
                            onClick={() => navigate('/products')}
                            style={{ background: '#ff6b35', border: 'none', marginRight: '1rem' }}
                        >
                            Shop Now
                        </Button>
                        <Button 
                            size="lg" 
                            variant="outline-dark"
                            onClick={() => navigate('/about')}
                            style={{ backgroundColor: '#ffffff', borderColor: '#ffffff', color: '#1f2937' }}
                        >
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="mb-5">
                <Row className="g-4">
                    <Col md={6} lg={3}>
                        <Card className="feature-card h-100 text-center">
                            <Card.Body>
                                <FaBox className="feature-icon mb-3" style={{ color: '#ff6b35', fontSize: '2.5rem' }} />
                                <h5>Genuine Products</h5>
                                <p className="text-muted">100% authentic spare parts from verified suppliers</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className="feature-card h-100 text-center">
                            <Card.Body>
                                <FaTruck className="feature-icon mb-3" style={{ color: '#3b82f6', fontSize: '2.5rem' }} />
                                <h5>Fast Delivery</h5>
                                <p className="text-muted">Quick shipping across India in 2-5 business days</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className="feature-card h-100 text-center">
                            <Card.Body>
                                <FaHeadset className="feature-icon mb-3" style={{ color: '#10b981', fontSize: '2.5rem' }} />
                                <h5>Expert Support</h5>
                                <p className="text-muted">Professional guidance from experienced technicians</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} lg={3}>
                        <Card className="feature-card h-100 text-center">
                            <Card.Body>
                                <FaShieldAlt className="feature-icon mb-3" style={{ color: '#f59e0b', fontSize: '2.5rem' }} />
                                <h5>Warranty Support</h5>
                                <p className="text-muted">Comprehensive warranty on all products</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </section>

            {/* Featured Products */}
            <section className="mb-5">
                <div className="section-header mb-4">
                    <h2 className="section-title">Featured Products</h2>
                    <p className="section-subtitle">Explore our best-selling items</p>
                </div>
                {!loading && products.length > 0 ? (
                    <Row>
                        {products.map((product) => (
                            <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                                <Product product={product} />
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Card className="text-center py-5">
                        <Card.Body>
                            <p className="text-muted">Loading products...</p>
                        </Card.Body>
                    </Card>
                )}
                <div className="text-center mt-4">
                    <Button 
                        size="lg"
                        className="btn-primary"
                        onClick={() => navigate('/products')}
                        style={{ background: '#ff6b35', border: 'none' }}
                    >
                        View All Products <FaArrowRight style={{ marginLeft: '0.5rem' }} />
                    </Button>
                </div>
            </section>

            {/* About Preview */}
            <section className="mb-5">
                <Card className="about-preview">
                    <Card.Body className="p-5">
                        <Row className="align-items-center">
                            <Col lg={8}>
                                <h2 className="mb-3">About Shree Selvanayagi Auto Spares</h2>
                                <p className="text-muted mb-3">
                                    With over 15 years of experience, Shree Selvanayagi Auto Spares has established itself 
                                    as a trusted name for quality products and reliable service in the auto spare parts industry.
                                </p>
                                <p className="text-muted mb-3">
                                    We work directly with leading manufacturers to bring you genuine products with warranty support. 
                                    Our knowledgeable team is always ready to assist you in finding the right spare parts.
                                </p>
                                <Button 
                                    onClick={() => navigate('/about')}
                                    className="btn-primary"
                                    style={{ background: '#ff6b35', border: 'none' }}
                                >
                                    Read More About Us <FaArrowRight style={{ marginLeft: '0.5rem' }} />
                                </Button>
                            </Col>
                            <Col lg={4} className="text-center mt-4 mt-lg-0">
                                <div className="stats-container">
                                    <div className="stat-box">
                                        <h3>15+</h3>
                                        <p>Years Experience</p>
                                    </div>
                                    <div className="stat-box">
                                        <h3>10000+</h3>
                                        <p>Happy Customers</p>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content text-center">
                    <h2>Need Help Finding the Right Part?</h2>
                    <p>Our expert team is here to help you find exactly what you need</p>
                    <Button 
                        size="lg"
                        className="btn-light"
                        onClick={() => navigate('/contact')}
                        style={{ backgroundColor: '#ffffff', borderColor: '#ffffff', color: '#ff6b35', fontWeight: 'bold' }}
                    >
                        Contact Us
                    </Button>
                </div>
            </section>
        </>
    );
};

export default HomePage;
