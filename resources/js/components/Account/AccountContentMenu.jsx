import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, Grid, IconButton } from '@mui/material';
import { Assignment, LocationOn, Lock, Support, Info, Notifications, ExitToApp } from '@mui/icons-material';
import { useNavigate, Outlet } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import axios from 'axios';
import { useSnackbar } from '../Theme/SnackbarAlert';

const AccountContentMenu = () => {
    const showSnackbar = useSnackbar();
    const [selectedMenu, setSelectedMenu] = useState('');
    const isMobile = useMediaQuery('(max-width:600px)');
    const navigate = useNavigate();

    const apiUrl = import.meta.env.VITE_API_URL;

    const handleLogout = async () => {
        const portal_token = localStorage.getItem('portal_token');
        try {
            const response = await axios.post(
                `${apiUrl}/portal/logout`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${portal_token}`
                    }
                }
            );

            if (response.status === 200 && response.data.status === true) {
                showSnackbar(response.data.message || "Logout successful", { severity: 'success' });
                // Clear storage and navigate after snackbar auto-closes
                setTimeout(() => {
                    localStorage.clear();
                    navigate("/");
                    window.location.reload();
                }, 2000); // Match this with your snackbar autoHideDuration
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error("Logout failed:", error);
            navigate("/");
        }
    };

    const menuItems = [
        { text: 'Order History', icon: <Assignment fontSize="medium" />, path: 'order-history' },
        { text: 'Address Book', icon: <LocationOn fontSize="medium" />, path: 'address-book' },
        { text: 'Account Privacy', icon: <Lock fontSize="medium" />, path: 'account-privacy' },
        { text: 'Customer Support & FAQ', icon: <Support fontSize="medium" />, path: 'support' },
        { text: 'General Info', icon: <Info fontSize="medium" />, path: 'general-info' },
        { text: 'Notification', icon: <Notifications fontSize="medium" />, path: 'notification' },
        { text: 'Logout', icon: <ExitToApp fontSize="medium" />, path: 'logout', onClick: handleLogout },
    ];

    const handleMenuClick = (item) => {
        if (item.onClick) {
            item.onClick();
        } else {
            setSelectedMenu(item.text);
            navigate(`/account/${item.path}`);
        }
    };

    return (
        <>
            <Grid container>
                {/* Sidebar Menu */}
                <Grid item xs={12} md={3} sx={{ borderRight: { md: '1px solid #e0e0e0' }, backgroundColor: "#fff" }}>
                    <Box padding="10px">
                        <Box sx={{ padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', ml: -4 }}>
                            <IconButton onClick={() => navigate("/")}>
                                <ArrowLeftIcon fontSize="large" color="#9F63FF" />
                            </IconButton>
                            <Typography variant="h6" sx={{ color: "#646363" }} fontWeight="bold">
                                Your Information
                            </Typography>
                        </Box>
                        <List>
                            {menuItems.map((item) => (
                                <ListItem
                                    key={item.text}
                                    component="div"
                                    role="button"
                                    sx={{
                                        borderRadius: 3,
                                        backgroundColor: selectedMenu === item.text ? '#f0f0f0' : 'transparent',
                                        '&:hover': { backgroundColor: '#f0f0f0' },
                                    }}
                                    onClick={() => handleMenuClick(item)}
                                >
                                    <ListItemIcon sx={{ minWidth: 50, marginRight: 2 }}>
                                        <Box sx={{ backgroundColor: '#f5f5f5', padding: 2.5, borderRadius: '12%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {item.icon}
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItem>
                            ))}
                        </List>
                        <Divider />
                    </Box>
                </Grid>

                {/* Content Area for Desktop */}
                {!isMobile && (
                    <Grid item xs={12} md={9}>
                        <Box padding="20px" backgroundColor="#f9f9f9">
                            <Outlet />
                        </Box>
                    </Grid>
                )}
            </Grid>
        </>
    );
};

export default AccountContentMenu;
