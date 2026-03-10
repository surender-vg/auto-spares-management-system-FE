import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Form, InputGroup, Button } from 'react-bootstrap';
import Product from '../components/Product';
import axios from 'axios';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { PRODUCT_CATEGORIES } from '../constants/categories';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await axios.get('/api/products');
            setProducts(data);
        };

        fetchProducts();
    }, []);

    // Filter products based on search term
    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.bikeModel.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
            categoryFilter === 'all' || product.category === categoryFilter;

        const priceValue = Number(product.price) || 0;
        const minOk = minPrice === '' || priceValue >= Number(minPrice);
        const maxOk = maxPrice === '' || priceValue <= Number(maxPrice);

        return matchesSearch && matchesCategory && minOk && maxOk;
    }).sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
        return 0;
    });

    return (
        <>
            {/* Page Header */}
            <div className="page-header mb-5">
                <h1>Our Products</h1>
                <p className="text-muted">Premium auto spare parts and accessories</p>
            </div>

            {/* Search & Filters */}
            <Card className="mb-4 filter-card">
                <Card.Body className="p-3">
                    <div className="d-flex gap-2 align-items-center" style={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}>
                        {/* Search Bar */}
                        <div style={{ flex: '1 1 auto', marginRight: '1rem' }}>
                            <InputGroup style={{ height: '42px' }}>
                                <InputGroup.Text style={{ 
                                    backgroundColor: '#ff6b35', 
                                    border: 'none', 
                                    color: 'white',
                                    padding: '0.5rem 1rem'
                                }}>
                                    <FaSearch style={{ fontSize: '1rem' }} />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ 
                                        border: '1px solid #d1d5db',
                                        fontSize: '0.95rem'
                                    }}
                                />
                            </InputGroup>
                        </div>

                        {/* Category Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px', flexShrink: 0 }}>
                            <label style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap', marginBottom: 0 }}>
                                Category:
                            </label>
                            <Form.Select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                style={{ 
                                    height: '42px',
                                    fontSize: '0.95rem',
                                    borderColor: '#d1d5db',
                                    minWidth: '120px'
                                }}
                            >
                                <option value="all">All</option>
                                {PRODUCT_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </Form.Select>
                        </div>

                        {/* Show More Filters Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            style={{ 
                                background: 'none',
                                border: 'none',
                                color: '#ff6b35',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0 0 0 1rem',
                                textDecoration: 'underline',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                marginLeft: '1rem'
                            }}
                        >
                            <FaFilter style={{ fontSize: '0.9rem' }} /> {showFilters ? 'Hide Filters' : 'Show More Filters'}
                        </button>
                    </div>

                    {/* Additional Filters Section */}
                    {showFilters && (
                        <Row className="g-3 mt-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">Sort By</Form.Label>
                                    <Form.Select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="name">Sort by Name</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">Min Price (₹)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="0"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">Max Price (₹)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="10000"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}
                </Card.Body>
            </Card>

            {/* Products Count */}
            <p className="text-muted mb-3">
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
                <Row>
                    {filteredProducts.map((product) => (
                        <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                            <Product product={product} />
                        </Col>
                    ))}
                </Row>
            ) : (
                <Card className="text-center py-5">
                    <Card.Body>
                        <h5>No products found</h5>
                        <p className="text-muted">Try adjusting your search or filter criteria</p>
                    </Card.Body>
                </Card>
            )}
        </>
    );
};

export default ProductsPage;
