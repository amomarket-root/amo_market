import React, { useEffect, useState, useCallback } from 'react';
import { Fab, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useCart } from './CartContext';
import axios from 'axios';

const CartButton = () => {
    const { cartModalOpen, openCartModal, cartSummary, setCartSummary } = useCart();
    const theme = useTheme();
    const apiUrl = import.meta.env.VITE_API_URL;
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [cartVisible, setCartVisible] = useState(false);

    const fetchCartSummary = useCallback(async () => {
        const portal_token = localStorage.getItem('portal_token');
        if (!portal_token) {
            setCartVisible(false);
            return;
        }

        try {
            const { data } = await axios.get(`${apiUrl}/portal/cart/summary`, {
                headers: { Authorization: `Bearer ${portal_token}` }
            });

            if (data.status && data.data.totalQuantity > 0) {
                setCartSummary(data.data);
                setCartVisible(true);
            } else {
                setCartVisible(false);
            }
        } catch (error) {
            console.error('Error fetching cart summary:', error);
            setCartVisible(false);
        }
    }, [apiUrl, setCartSummary]);

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (!userId) return;

        fetchCartSummary();

        const channel = window.Echo.channel(`cart_update.${userId}`)
            .listen('.cart.update', (data) => {
                if (data?.cartSummary) {
                    setCartSummary(data.cartSummary);
                    setCartVisible(data.cartSummary.totalQuantity > 0);
                }
            });

        window.addEventListener('cartChange', fetchCartSummary);

        return () => {
            window.Echo.leave(`cart_update.${userId}`);
            window.removeEventListener('cartChange', fetchCartSummary);
        };
    }, [fetchCartSummary]);

    return (
        <>
            {cartVisible && isMobile && !cartModalOpen && (
                <Fab
                    variant="extended"
                    color="success"
                    sx={{
                        position: 'fixed',
                        top: '88%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                         backgroundColor: '#0cc10f',
                        display: 'flex',
                        alignItems: 'center',
                        zIndex: 2000,
                        minWidth: '300px',
                        height: '60px',
                        fontSize: '1rem',
                    }}
                    onClick={openCartModal}
                >
                    <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '6px', borderRadius: '20%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
                        <ShoppingCartIcon sx={{ color: 'white', fontSize: '24px' }} />
                    </Box>
                    <Box sx={{ color: 'white', flexGrow: 1, textAlign: 'left' }}>
                        <div>{cartSummary.totalQuantity} item(s)</div>
                        <div style={{ fontWeight: 'bold' }}>₹{cartSummary.totalAmount}</div>
                    </Box>
                    <Box sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px', padding: '4px 16px', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                        View Cart
                    </Box>
                </Fab>
            )}
        </>
    );
};

export default CartButton;
