import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import Theme from './Theme';
import { Box, IconButton, Tooltip } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

const Layout = ({ children }) => {
    const [showScroll, setShowScroll] = useState(false);
    const isInitialMount = useRef(true);

    // Scroll to the top when the Layout mounts for the first time
    useEffect(() => {
        if (isInitialMount.current) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            isInitialMount.current = false;
        }
    }, []);

    // Scroll to the top when children change (page navigation)
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [children]);

    // Handle scroll visibility
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 200) {
                setShowScroll(true);
            } else {
                setShowScroll(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <ThemeProvider theme={Theme}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                }}
            >
                <Header />
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        pt: 4,
                        pb: 2,
                        px: 1,
                    }}
                >
                    {children}
                </Box>
                <Footer />

                {/* Scroll to Top Button with Tooltip */}
                {showScroll && (
                    <Tooltip title="Scroll To Top" arrow>
                        <IconButton
                            onClick={scrollToTop}
                            sx={{
                                position: 'fixed',
                                bottom: 16,
                                right: 16,
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': { backgroundColor: 'primary.dark' },
                                width: 48,
                                height: 48,
                                boxShadow: 5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0
                            }}
                        >
                            <img
                                src="/image/arrow_up.gif"
                                alt="Scroll To Top"
                                style={{ width: 30, height: 30 }}
                                loading="eager"
                                decoding="async"
                            />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </ThemeProvider>
    );
};

export default Layout;
