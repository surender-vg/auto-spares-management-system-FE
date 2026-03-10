
import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const Product = ({ product }) => {
    const { addToCart } = useCart();
    const [adding, setAdding] = useState(false);

    const handleAddToCart = async () => {
        try {
            setAdding(true);
            await addToCart(product._id, 1);
            toast.success(`${product.name} added to cart!`);
        } catch (error) {
            console.error('Add to cart error:', error);
            toast.error('Failed to add item to cart');
        } finally {
            setAdding(false);
        }
    };
    return (
        <Card className="my-3 p-3 rounded product-card-custom">
            <Link to={`/product/${product._id}`}>
                <Card.Img src={product.image} variant="top" />
            </Link>

            <Card.Body className="d-flex flex-column justify-content-between">
                <div>
                    <Link to={`/product/${product._id}`}>
                        <Card.Title as="div">
                            <strong>{product.name}</strong>
                        </Card.Title>
                    </Link>

                    <Card.Text as="div">
                        <div className="my-3">
                            {product.brand} - {product.category}
                        </div>
                    </Card.Text>

                    <Card.Text as="h3">₹{product.price}</Card.Text>
                </div>
                {/* Add to Cart Button */}
                <Button
                    variant="primary"
                    className="mt-3 add-to-cart-btn"
                    style={{ background: '#ff6b35', border: 'none', fontWeight: 600 }}
                    onClick={handleAddToCart}
                    disabled={adding}
                >
                    {adding ? 'Adding...' : 'Add to Cart'}
                </Button>
            </Card.Body>
        </Card>
    );
};

export default Product;
