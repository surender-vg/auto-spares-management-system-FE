import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaEnvelope, FaCheckCircle, FaReply } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const MyMessagesPage = () => {
    const [email, setEmail] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearchMessages = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            toast.error('Please enter your email');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`/api/contact/messages/${email}`);
            setMessages(response.data);
            setSearched(true);
            if (response.data.length === 0) {
                toast.info('No messages found for this email');
            }
        } catch (error) {
            toast.error('Failed to fetch messages');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            {/* Page Header */}
            <div className="page-header mb-5">
                <h1>My Messages</h1>
                <p className="text-muted">View your submitted messages and replies from our team</p>
            </div>

            {/* Search Form */}
            <Row className="mb-4">
                <Col lg={6} className="mx-auto">
                    <Card>
                        <Card.Body>
                            <Form onSubmit={handleSearchMessages}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">
                                        <FaEnvelope style={{ marginRight: '0.5rem' }} />
                                        Enter Your Email
                                    </Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <small className="text-muted">
                                        Enter the email you used to submit the contact form
                                    </small>
                                </Form.Group>
                                <Button
                                    type="submit"
                                    className="w-100"
                                    style={{ backgroundColor: '#ff6b35', border: 'none' }}
                                    disabled={loading}
                                >
                                    {loading ? 'Searching...' : 'Search Messages'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Messages Display */}
            {searched && (
                <Row>
                    <Col>
                        {messages.length === 0 ? (
                            <Alert variant="info">
                                <strong>No messages found.</strong> You haven't submitted any contact messages yet.
                            </Alert>
                        ) : (
                            <>
                                <Alert variant="success">
                                    Found {messages.length} message{messages.length !== 1 ? 's' : ''} for <strong>{email}</strong>
                                </Alert>

                                {messages.map((message) => (
                                    <Card key={message._id} className="mb-4">
                                        <Card.Header className="bg-light">
                                            <Row className="align-items-center">
                                                <Col>
                                                    <h5 className="mb-1">{message.subject || 'No Subject'}</h5>
                                                    <small className="text-muted">
                                                        Submitted on {new Date(message.createdAt).toLocaleString()}
                                                    </small>
                                                </Col>
                                                <Col md={3} className="text-end">
                                                    {message.isReplied ? (
                                                        <span className="badge bg-success" style={{ fontSize: '0.9rem' }}>
                                                            <FaCheckCircle style={{ marginRight: '0.3rem' }} />
                                                            Replied
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-warning" style={{ fontSize: '0.9rem' }}>
                                                            Awaiting Reply
                                                        </span>
                                                    )}
                                                </Col>
                                            </Row>
                                        </Card.Header>
                                        <Card.Body>
                                            {/* Your Message */}
                                            <div className="mb-4">
                                                <h6 className="text-muted mb-2">
                                                    <strong>Your Message:</strong>
                                                </h6>
                                                <Card className="bg-light border-0">
                                                    <Card.Body>
                                                        <p className="mb-0">{message.message}</p>
                                                    </Card.Body>
                                                </Card>
                                            </div>

                                            {/* Reply */}
                                            {message.isReplied ? (
                                                <div className="mb-0">
                                                    <h6 className="text-success mb-2">
                                                        <FaReply style={{ marginRight: '0.5rem' }} />
                                                        <strong>Our Reply:</strong>
                                                    </h6>
                                                    <Card className="border-success bg-success bg-opacity-10">
                                                        <Card.Body>
                                                            <p className="mb-2">{message.reply}</p>
                                                            <small className="text-muted">
                                                                Replied on {new Date(message.repliedAt).toLocaleString()}
                                                            </small>
                                                        </Card.Body>
                                                    </Card>
                                                </div>
                                            ) : (
                                                <Alert variant="info" className="mb-0">
                                                    <strong>Your message is being reviewed.</strong> We will send you a reply soon!
                                                </Alert>
                                            )}
                                        </Card.Body>
                                    </Card>
                                ))}
                            </>
                        )}
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default MyMessagesPage;
