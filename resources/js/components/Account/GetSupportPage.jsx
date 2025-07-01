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
import ChatIcon from '@mui/icons-material/Chat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const GetSupportPage = () => {
    const navigate = useNavigate(); // Initialize the useNavigate hook

    const handleChatSupportClick = () => {
        navigate('/account/chat-support'); // Redirect to ChatSupportPage.js when clicked
    };

    return (
        <Container sx={{ maxWidth: '100%', padding: '0px', mt: 0 }} maxWidth={false}>
            <Box sx={{ padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', ml: -3 }}>
                <IconButton onClick={() => window.history.back()} >
                   <ArrowBackIcon fontSize="large" color="#9F63FF" />
                </IconButton>
                <Typography variant="h5" sx={{ color: "#646363" }} fontWeight="bold">
                    Customer Support
                </Typography>
            </Box>
            <Grid container spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
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
                    title: 'SUPPORT PARTNER INSTRUCTIONS',
                    items: [
                        {
                            icon: <PhoneIcon />,
                            text: 'Call Support Partner',
                            link: 'tel:7008392889' // Phone number link for dial
                        },
                        {
                            icon: <ChatIcon />,
                            text: 'Chat With Support Partner',
                            action: handleChatSupportClick // Handle chat click action
                        },
                    ],
                },
            ].map((section, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'grey.600', display: 'block', mb: 1 }}>
                        {section.title}
                    </Typography>
                    <List>
                        {section.items.map((item, idx) => (
                            <ListItem
                                button
                                key={idx}
                                sx={{ borderRadius: 1, '&:hover': { backgroundColor: 'grey.100' } }}
                                component="a" // For calling use "a" tag, else handle click
                                href={item.link || undefined}
                                onClick={item.action || undefined} // Use action if defined
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                                <ArrowForwardIosIcon fontSize="small" sx={{ color: 'grey.500' }} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            ))}

            {/* New "Cancellation Policy" Section */}
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: '#FFF7E0', boxShadow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black', display: 'block', mb: 1 }}>
                    Support Policy
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.800' }}>
                    We are here to help with any questions or issues you may have.
                    Please reach out to our support team for assistance with your order,
                    delivery, or account details. Note that all cancellations and requests
                    are subject to our terms and conditions.
                </Typography>
            </Paper>
        </Container>
    );
};

export default GetSupportPage
