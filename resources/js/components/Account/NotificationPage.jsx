import React from "react";
import { Container, Typography, Paper, Box, IconButton } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CategoryIcon from '@mui/icons-material/Category';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DiscountIcon from '@mui/icons-material/Discount';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

const notifications = [
    { text: "First 3 deliveries will be free if shopping more than Rs. 300.", icon: <LocalShippingIcon color="primary" /> },
    { text: "We are adding more categories to enhance your shopping experience.", icon: <CategoryIcon sx={{ color: "#FFA500" }} /> },
    { text: "Shops are adding more products every day—stay tuned for new arrivals!", icon: <StorefrontIcon sx={{ color: "#4CAF50" }} /> },
    { text: "Exclusive discounts coming soon—get ready for amazing deals!", icon: <DiscountIcon sx={{ color: "#E91E63" }} /> },
    { text: "Order tracking system improved for a smoother experience.", icon: <TrackChangesIcon sx={{ color: "#2196F3" }} /> }
];

const NotificationPage = () => {
    return (
        <Container sx={{ maxWidth: '100%', padding: '0px', mt: 0 }} maxWidth={false}>
            <Box sx={{ padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', ml: -3 }}>
                <IconButton onClick={() => window.history.back()} >
                  <ArrowBackIcon fontSize="large" color="#9F63FF" />
                </IconButton>
                <Typography variant="h5" sx={{ color: "#646363" }} fontWeight="bold">
                    Notifications
                </Typography>
            </Box>

            <Typography variant="h5" sx={{ color: "#f27474", mb: 2, mt: 2 }} fontWeight="bold">
                Latest Updates
            </Typography>

            {notifications.map((notification, index) => (
                <Paper key={index} elevation={3} sx={{ p: 2, display: "flex", alignItems: "center", mb: 2, borderRadius: 2 }}>
                    {notification.icon}
                    <Typography variant="body1" sx={{ ml: 2 }}>
                        {notification.text}
                    </Typography>
                </Paper>
            ))}
        </Container>
    );
};

export default NotificationPage;
