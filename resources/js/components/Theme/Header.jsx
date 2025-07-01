import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import LoginModal from "../Auth/LoginModal";
import { useCart } from "../Cart/CartContext";
import Location from "../Location/Location";
import SearchComponent from "./SearchComponent";
import axios from 'axios';

const Header = () => {
    const navigate = useNavigate();
    const [openLoginModal, setOpenLoginModal] = useState(false);
    const [cartQuantity, setCartQuantity] = useState(0);
    const { openCartModal } = useCart();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const fetchCartQuantity = async () => {
        const apiUrl = import.meta.env.VITE_API_URL;
        const portal_token = localStorage.getItem('portal_token');
        if (!portal_token) {
            console.log('User is not authenticated');
            return;
        }

        try {
            const response = await axios.get(`${apiUrl}/portal/cart/summary`, {
                headers: { Authorization: `Bearer ${portal_token}` },
            });
            setCartQuantity(response.data?.data?.totalQuantity || 0);
        } catch (err) {
            console.error('Error fetching cart quantity:', err);
        }
    };

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (userId) {
            // Try WebSocket first
            window.Echo.channel(`cart_update.${userId}`)
                .listen('.cart.update', (data) => {
                    setCartQuantity(data?.cartSummary?.totalQuantity);
                })
                .error((err) => {
                    console.error('WebSocket error:', err);
                    // Fallback to API call if WebSocket fails
                    fetchCartQuantity();
                });
        }

        // Fetch cart quantity on mount as a fallback
        fetchCartQuantity();

        return () => {
            if (userId) {
                window.Echo.leave(`cart_update.${userId}`);
            }
        };
    }, []);

    const handleLocationSelect = (description) => {
        // Handle the location selection logic
    };

    const handleOpenLoginModal = () => setOpenLoginModal(true);
    const handleCloseLoginModal = () => setOpenLoginModal(false);

    const handleCartButtonClick = () => {
        if (localStorage.getItem("portal_token")) {
            openCartModal();
        } else {
            handleOpenLoginModal();
        }
    };

    const handleAccountButtonClick = () => localStorage.getItem("portal_token") ? navigate("/account") : handleOpenLoginModal();

    return (
        <AppBar
            sx={{
                backgroundColor: '#fff',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px',
                zIndex: 1100,
            }}
            position="sticky"
        >
            {isMobile ? (
                <Toolbar style={{ marginBottom: 10, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={6}>
                                <Box display="flex" alignItems="center">
                                    <Location
                                        style={{ color: "#000", cursor: "pointer", marginLeft: 0 }}
                                        onLocationSelect={handleLocationSelect}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={6} display="flex" justifyContent="flex-end">
                                <IconButton sx={{ color: '#5b5858' }} color="inherit" onClick={handleAccountButtonClick}>
                                    <img
                                        src="/image/account_avatar.gif"
                                        alt="Profile"
                                        style={{ width: 40, height: 40 }}
                                        loading="eager"
                                        decoding="async"
                                    />
                                </IconButton>
                            </Grid>
                            <Grid item xs={12}>
                                <SearchComponent />
                            </Grid>
                        </Grid>
                    </Box>
                </Toolbar>
            ) : (
                <Toolbar style={{ marginBottom: 10, zIndex: 1, overflow: 'hidden' }}>
                    <Grid container alignItems="center" justifyContent="space-between">
                        {/* Left Section - Logo & Location */}
                        <Grid item xs={5} md={5} lg={5} xl={5} display="flex" alignItems="center">
                            <Typography
                                variant="h5"
                                noWrap
                                sx={{ fontWeight: "bold", color: "#9F63FF", mr: 2 }}
                            >
                                Amo<span style={{ color: "#10d915" }}> Market</span>
                            </Typography>
                            <Location
                                style={{ color: "#000", cursor: "pointer", marginLeft: 10 }}
                                onLocationSelect={handleLocationSelect}
                            />
                        </Grid>

                        {/* Center Section - Search Component */}
                        <Grid item xs={4} md={4} lg={4} xl={4} display="flex" justifyContent="center">
                            <SearchComponent />
                        </Grid>

                        {/* Right Section - Account & Cart */}
                        <Grid item xs={3} md={3} lg={3} xl={3} display="flex" justifyContent="flex-end" alignItems="center">
                            <IconButton sx={{ color: '#5b5858', mr: 2 }} onClick={handleAccountButtonClick}>
                                <AccountCircleTwoToneIcon fontSize="large" />
                                <Typography variant="body1" sx={{ ml: 1 }}>
                                    {localStorage.getItem("portal_token") ? "Account" : "Login"}
                                </Typography>
                            </IconButton>
                            <IconButton
                                style={{ backgroundColor: 'green', borderRadius: 8, padding: '6px 12px' }}
                                onClick={handleCartButtonClick}
                            >
                                <Badge badgeContent={cartQuantity} color="secondary">
                                    <ShoppingCartIcon sx={{ color: "white" }} />
                                </Badge>
                                <Typography variant="body1" sx={{ color: "white", ml: 1 }}>
                                    My Cart
                                </Typography>
                            </IconButton>
                        </Grid>
                    </Grid>
                </Toolbar>
            )}
            <LoginModal open={openLoginModal} onClose={handleCloseLoginModal} />
        </AppBar>
    );
};

export default Header;
