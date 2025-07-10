import React, { useRef, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Theme from './Theme';
import { Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import FooterContent from './FooterContent';

const Layout = ({ children }) => {
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            window.scrollTo({ top: 0 });
            isInitialMount.current = false;
        }
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [children]);

    return (
        <ThemeProvider theme={Theme}>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <Box component="main" sx={{ flex: 1, pt: 4, pb: 2, px: 1 }}>
                    {children}
                </Box>
                <Footer />
                <FooterContent />
            </Box>
        </ThemeProvider>
    );
};

export default Layout;
