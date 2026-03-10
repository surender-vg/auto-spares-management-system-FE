import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';

const PaymentPage = () => {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('Razorpay');

    const submitHandler = (e) => {
        e.preventDefault();
        
        // Save payment method to localStorage
        localStorage.setItem('paymentMethod', paymentMethod);
        
        toast.success('Payment method saved');
        navigate('/placeorder');
    };

    return (
        <div className="checkout-steps mb-4">
            <div className="checkout-step completed">Sign In</div>
            <div className="checkout-step completed">Shipping</div>
            <div className="checkout-step active">Payment</div>
            <div className="checkout-step">Place Order</div>
            
            <Card className="auth-form-container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
                <h1>Payment Method</h1>
                <Form onSubmit={submitHandler}>
                    <Form.Group>
                        <Form.Label as="legend">Select Payment Method</Form.Label>
                        <Col>
                            <Form.Check
                                type="radio"
                                label="Razorpay (UPI, Cards, Netbanking)"
                                id="Razorpay"
                                name="paymentMethod"
                                value="Razorpay"
                                checked={paymentMethod === 'Razorpay'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="mb-3"
                            />
                            <Form.Check
                                type="radio"
                                label="Cash on Delivery"
                                id="COD"
                                name="paymentMethod"
                                value="Cash on Delivery"
                                checked={paymentMethod === 'Cash on Delivery'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="mb-3"
                            />
                        </Col>
                    </Form.Group>

                    <Button type="submit" variant="primary" className="mt-3">
                        Continue
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default PaymentPage;
