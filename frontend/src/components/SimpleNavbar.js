import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const SimpleNavbar = () => {
    const navigate = useNavigate();

    const styles = {
        navbar: {
            backgroundColor: '#fafafa',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            padding: '0.5rem 0'
        },
        logoContainer: {
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
        },
        logo: {
            height: '40px',
            width: 'auto',
            objectFit: 'contain'
        }
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <Navbar style={styles.navbar} expand="lg">
            <Container>
                <div 
                    style={styles.logoContainer}
                    onClick={handleLogoClick}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleLogoClick();
                        }
                    }}
                >
                    <img
                        src="/assets/images/minoLogo.jpg"
                        alt="Mino Logo"
                        style={styles.logo}
                    />
                </div>
            </Container>
        </Navbar>
    );
};

export default SimpleNavbar;