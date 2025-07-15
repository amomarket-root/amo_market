import React, { useEffect, useState } from 'react';
import {
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; // <-- Add this

const FooterContent = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate(); // <-- Hook for navigation
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [value, setValue] = useState(0);
    const [animationIndex, setAnimationIndex] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setVisible(currentScrollY <= lastScrollY);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimationIndex((prevIndex) => (prevIndex + 1) % 5);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    if (!isMobile) return null;

    const iconStyle = {
        width: 30,
        height: 30,
        marginBottom: '6px',
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
        switch (newValue) {
            case 0:
                navigate('/');
                break;
            case 1:
                navigate('/see_all_category');
                break;
            case 2:
                navigate('/see_all_product');
                break;
            case 3:
                navigate('/see_all_service');
                break;
            case 4:
                navigate('/see_all_shop');
                break;
            default:
                break;
        }
    };

    return (
        <Paper
            elevation={5}
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                transform: visible ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.5s ease-in-out',
                zIndex: 999,
                borderTop: '1px solid #ddd',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                overflow: 'hidden',
                bgcolor: '#fff',
            }}
        >
            <BottomNavigation
                showLabels
                value={value}
                onChange={handleChange}
                sx={{
                    bgcolor: 'white',
                    height: 70,
                    '& .Mui-selected': {
                        color: theme.palette.primary.main,
                    },
                    '& .MuiBottomNavigationAction-label': {
                        fontWeight: 'bold',
                        fontSize: 12,
                    },
                }}
            >
                <BottomNavigationAction
                    label="Home"
                    icon={
                        <img
                            src="/image/footer_content/home.webp"
                            alt="Home"
                            className={animationIndex === 0 ? 'animate-bounce' : ''}
                            style={iconStyle}
                        />
                    }
                />
                <BottomNavigationAction
                    label="Categories"
                    icon={
                        <img
                            src="/image/footer_content/categories.webp"
                            alt="Categories"
                            className={animationIndex === 1 ? 'animate-rotate' : ''}
                            style={iconStyle}
                        />
                    }
                />
                <BottomNavigationAction
                    label="Products"
                    icon={
                        <img
                            src="/image/footer_content/products.webp"
                            alt="Products"
                            className={animationIndex === 2 ? 'animate-pulse' : ''}
                            style={iconStyle}
                        />
                    }
                />
                <BottomNavigationAction
                    label="Services"
                    icon={
                        <img
                            src="/image/footer_content/services.webp"
                            alt="Services"
                            className={animationIndex === 3 ? 'animate-flip' : ''}
                            style={iconStyle}
                        />
                    }
                />
                <BottomNavigationAction
                    label="Shops"
                    icon={
                        <img
                            src="/image/footer_content/shops.webp"
                            alt="Shops"
                            className={animationIndex === 4 ? 'animate-zoom' : ''}
                            style={iconStyle}
                        />
                    }
                />
            </BottomNavigation>
        </Paper>
    );
};

export default FooterContent;
