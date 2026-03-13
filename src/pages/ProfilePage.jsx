import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
        }
    }, [user]);

    const submitHandler = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Name cannot be empty');
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            await axios.put(
                '/api/users/profile',
                { name },
                config
            );

            toast.success('Name updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Row className="justify-content-md-center">
            <Col xs={12} md={8}>
                <Card className="auth-form-container">
                    {user?.role === 'admin' && (
                        <Button
                            variant="outline-secondary"
                            className="mb-3"
                            style={{ width: 'fit-content' }}
                            onClick={() => navigate('/admin/dashboard')}
                        >
                            ← Back to Dashboard
                        </Button>
                    )}
                    <h1>User Profile</h1>
                    <Form onSubmit={submitHandler}>
                        <Form.Group controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mt-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                value={user?.email || ''}
                                disabled
                                style={{ background: '#f3f4f6', color: '#6b7280' }}
                            />
                        </Form.Group>

                        <Button type="submit" variant="primary" className="mt-3" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Name'}
                        </Button>
                    </Form>

                    <Row className="py-3">
                        <Col>
                            <div className="user-info">
                                <h5>Account Information</h5>
                                <p><strong>Role:</strong> {user?.role || 'customer'}</p>
                                <p><strong>Member Since:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    );
};

export default ProfilePage;
