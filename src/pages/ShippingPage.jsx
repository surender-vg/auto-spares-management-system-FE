import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ShippingPage = () => {
    const { saveShippingAddress } = useCart(); // I need to add this method to context
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');

    const submitHandler = (e) => {
        e.preventDefault();
        // saveShippingAddress({ address, city, postalCode, country });
        // Since I haven't implemented saveShippingAddress in context yet, I'll do a quick hack or update context.
        localStorage.setItem('shippingAddress', JSON.stringify({ address, city, postalCode, country }));
        navigate('/payment');
    };

    return (
        <Form onSubmit={submitHandler}>
            <h1>Shipping</h1>
            <Form.Group controlId='address'>
                <Form.Label>Address</Form.Label>
                <Form.Control
                    type='text'
                    required
                    placeholder='Enter address'
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                ></Form.Control>
            </Form.Group>

            <Form.Group controlId='city'>
                <Form.Label>City</Form.Label>
                <Form.Control
                    type='text'
                    required
                    placeholder='Enter city'
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                ></Form.Control>
            </Form.Group>

            <Form.Group controlId='postalCode'>
                <Form.Label>Postal Code</Form.Label>
                <Form.Control
                    type='text'
                    required
                    placeholder='Enter postal code'
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                ></Form.Control>
            </Form.Group>

            <Form.Group controlId='country'>
                <Form.Label>Country</Form.Label>
                <Form.Control
                    type='text'
                    required
                    placeholder='Enter country'
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                ></Form.Control>
            </Form.Group>

            <Button type='submit' variant='primary' className="mt-3">
                Continue
            </Button>
        </Form>
    );
};

export default ShippingPage;
