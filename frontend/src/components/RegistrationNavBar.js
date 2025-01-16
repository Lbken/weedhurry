import React from "react";
import { Navbar, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const RegistrationNavBar = () => {
  return (
    <Navbar bg="dark" variant="dark" className="py-3">
      <Container className="d-flex justify-content-center">
        <Navbar.Brand as={Link} to="/nearby" className="d-flex align-items-center">
          <img
            src={require('../assets/images/navbarLogo.png')}
            alt="Logo"
            style={{ height: "60px", width: "auto" }}
            className="mx-auto"
          />
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default RegistrationNavBar;
