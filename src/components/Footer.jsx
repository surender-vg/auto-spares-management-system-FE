import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer>
            <Container>
                <Row>
                    <Col className="text-center py-3">
                        <p>Copyright &copy; {new Date().getFullYear()} Shree selvanayagi auto spares</p>
                        <p>Email: <a href="mailto:selvanayagischml@gmail.com">selvanayagischml@gmail.com</a></p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
