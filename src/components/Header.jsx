import React from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
    const { user, logout } = useAuth();
    const { cartItems } = useCart();

    return (
        <header>
            <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
                <Container>
                    <LinkContainer to="/">
                        <Navbar.Brand style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img 
                                src="/logo.png" 
                                alt="Shree Selvanayagi Auto Spares Logo" 
                                style={{ height: '60px', width: '60px', objectFit: 'contain' }}
                            />
                            <span>Shree selvanayagi auto spares</span>
                        </Navbar.Brand>
                    </LinkContainer>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <LinkContainer to="/products">
                                <Nav.Link>
                                    Products
                                </Nav.Link>
                            </LinkContainer>
                            <LinkContainer to="/about">
                                <Nav.Link>
                                    About Us
                                </Nav.Link>
                            </LinkContainer>
                            <LinkContainer to="/contact">
                                <Nav.Link>
                                    Contact Us
                                </Nav.Link>
                            </LinkContainer>
                            <LinkContainer to="/cart">
                                <Nav.Link style={{ position: 'relative', display: 'inline-block' }}>
                                    <span style={{ position: 'relative' }}>
                                        <FaShoppingCart />
                                        {cartItems.length > 0 && (
                                            <Badge 
                                                bg="danger" 
                                                style={{ 
                                                    position: 'absolute',
                                                    top: '-10px',
                                                    right: '-8px',
                                                    fontSize: '0.75rem',
                                                    padding: '2px 5px',
                                                    borderRadius: '50%',
                                                    minWidth: '20px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {cartItems.length}
                                            </Badge>
                                        )}
                                    </span>
                                    {' Cart'}
                                </Nav.Link>
                            </LinkContainer>
                            {user ? (
                                <NavDropdown title={user.name} id="username">
                                    <LinkContainer to="/profile">
                                        <NavDropdown.Item>Profile</NavDropdown.Item>
                                    </LinkContainer>
                                    <LinkContainer to="/myorders">
                                        <NavDropdown.Item>My Orders</NavDropdown.Item>
                                    </LinkContainer>
                                    {user.role === 'admin' && (
                                        <>
                                            <NavDropdown.Divider />
                                            <LinkContainer to="/admin/dashboard">
                                                <NavDropdown.Item>Go to Dashboard</NavDropdown.Item>
                                            </LinkContainer>
                                        </>
                                    )}
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                                </NavDropdown>
                            ) : (
                                <LinkContainer to="/login">
                                    <Nav.Link>
                                        <FaUser /> Sign In
                                    </Nav.Link>
                                </LinkContainer>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
};

export default Header;
