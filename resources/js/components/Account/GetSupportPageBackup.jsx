import React from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Paper,
    Grid,
    Container,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Import missing icon

const GetSupportPage = () => {
    return (
        <Container sx={{ maxWidth: '100%', padding: '0px', mt: 0 }} maxWidth={false}>
            <Box sx={{ padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', ml: -3 }}>
                <IconButton onClick={() => window.history.back()} >
                    <ArrowBackIcon fontSize="large" sx={{ color: "#9F63FF" }} />
                </IconButton>
                <Typography variant="h5" sx={{ color: "#646363" }} fontWeight="bold">
                    Customer Support
                </Typography>
            </Box>
            <Grid container spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Hi!
                            </Typography>
                            <Typography variant="subtitle1" component="p">
                                How can we help you?
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} display="flex" justifyContent="center">
                    <img src="/image/support.gif" alt="Support GIF" width="100%" style={{ maxWidth: '200px' }} />
                </Grid>
            </Grid>

            {/* Sections */}
            {[
                {
                    title: 'UPDATE YOUR DETAILS',
                    items: [
                        { icon: <PhoneIcon />, text: 'Add alternate contact number' },
                        { icon: <WhatsAppIcon />, text: 'Get order updates on WhatsApp' },
                    ],
                },
                {
                    title: 'MAKE CHANGES TO YOUR ORDER',
                    items: [{ icon: <PhoneIcon />, text: 'Call restaurant' }],
                },
                {
                    title: 'DELIVERY PARTNER INSTRUCTIONS',
                    items: [
                        { icon: <PhoneIcon />, text: 'Call delivery partner' },
                        { icon: <ChatIcon />, text: 'Chat with delivery partner' },
                    ],
                },
            ].map((section, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'grey.600', display: 'block', mb: 1 }}>
                        {section.title}
                    </Typography>
                    <List>
                        {section.items.map((item, idx) => (
                            <ListItem button key={idx} sx={{ borderRadius: 1, '&:hover': { backgroundColor: 'grey.100' } }}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                                <ArrowForwardIosIcon fontSize="small" sx={{ color: 'grey.500' }} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            ))}

            {/* New "Go to Support" Section */}
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'grey.600', display: 'block', mb: 1 }}>
                    CONTACT AMO MARKET
                </Typography>
                <ListItem button sx={{ borderRadius: 1, '&:hover': { backgroundColor: 'grey.100' } }}>
                    <ListItemIcon>
                        <AccountCircleIcon fontSize="large" />
                    </ListItemIcon>
                    <ListItemText primary="Go to support" />
                    <ArrowForwardIosIcon fontSize="small" sx={{ color: 'grey.500' }} />
                </ListItem>
            </Paper>

            {/* New "Cancellation Policy" Section */}
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: '#FFF7E0', boxShadow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black', display: 'block', mb: 1 }}>
                    Cancellation Policy
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.800' }}>
                    Help us reduce food waste by avoiding cancellations after placing your order.
                    A 100% cancellation fee will be applied.
                </Typography>
            </Paper>
        </Container>
    );
};

export default GetSupportPage;
