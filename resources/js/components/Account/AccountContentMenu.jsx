import React, { useState } from 'react';
import {Box,Typography,List,ListItem,ListItemIcon,ListItemText,Divider,Grid,IconButton} from '@mui/material';
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
                setTimeout(() => {
                    localStorage.clear();
                    navigate("/");
                    window.location.reload();
                }, 2000);
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error("Logout failed:", error);
            navigate("/");
        }
    };

    const menuItems = [
        { text: 'Order History', iconPath: '/image/account_info/order_history.webp', path: 'order-history' },
        { text: 'Address Book', iconPath: '/image/account_info/address_book.webp', path: 'address-book' },
        { text: 'Account Privacy', iconPath: '/image/account_info/account_privacy.webp', path: 'account-privacy' },
        { text: 'Customer Support & FAQ', iconPath: '/image/account_info/support.webp', path: 'support' },
        { text: 'General Info', iconPath: '/image/account_info/general_info.webp', path: 'general-info' },
        { text: 'Notification', iconPath: '/image/account_info/notification.webp', path: 'notification' },
        { text: 'Logout', iconPath: '/image/account_info/logout.webp', path: 'logout', onClick: handleLogout },
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
        <Grid container>
            {/* Sidebar Menu */}
            <Grid item xs={12} md={3} sx={{ borderRight: { md: '1px solid #e0e0e0' }, backgroundColor: "#fff" }}>
                <Box padding="10px">
                    <Box sx={{ padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', ml: -4 }}>
                        <IconButton onClick={() => navigate("/")}>
                            <ArrowLeftIcon fontSize="large" sx={{ color: "#9F63FF" }} />
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
                                    <Box
                                        sx={{
                                            backgroundColor: '#f5f5f5',
                                            padding: 1.5,
                                            borderRadius: '12%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 40,
                                            height: 40
                                        }}
                                    >
                                        <img
                                            src={item.iconPath}
                                            alt={item.text}
                                            style={{ width: 30, height: 30, objectFit: 'contain' }}
                                        />
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
    );
};

export default AccountContentMenu;
