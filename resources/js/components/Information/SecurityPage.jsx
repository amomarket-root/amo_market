import React, { useEffect, useState } from 'react';
import { Grid, Typography, Paper, useTheme, useMediaQuery, Box, Skeleton } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';

const SecurityPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [securityData, setSecurityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchSecurityData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/portal/security`);
                if (response.data.success && response.data.data.length > 0) {
                    // Parse the content_sections array from string to actual array
                    const parsedData = {
                        ...response.data.data[0],
                        content_sections: JSON.parse(response.data.data[0].content_sections)
                    };
                    setSecurityData(parsedData);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch security data');
            } finally {
                setLoading(false);
            }
        };

        fetchSecurityData();
    }, []);

    // Fallback content if API doesn't return data
    const defaultContent = [
        "At Amo Market, your security and privacy are our top priorities. We are committed to ensuring that your personal information and transactions are protected at all times.",
        "We use advanced encryption technologies to safeguard your data during transmission and storage. This ensures that your sensitive information, such as payment details and personal data, remains secure.",
        "Our platform complies with industry-standard security protocols and regulations. We regularly update our systems and conduct security audits to identify and address potential vulnerabilities.",
        "Your trust is important to us. That's why we have implemented strict access controls and authentication measures to prevent unauthorized access to your account. We also provide you with tools to manage your privacy settings and control how your data is used.",
        "If you have any questions or concerns about your security or privacy, our dedicated support team is here to assist you. At Amo Market, we are committed to providing you with a safe and secure shopping experience.",
        "Thank you for trusting us with your security. We will continue to work tirelessly to protect your information and provide you with peace of mind."
    ];

    const contentToDisplay = securityData?.content_sections || defaultContent.map(content => ({ content }));
    const introductionToDisplay = securityData?.introduction || defaultContent[0];
    const imagePath = securityData?.image_path || '/image/security.webp';

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={3} sx={{ padding: isMobile ? 2 : 4 }}>
            {/* Image Section */}
            <Grid item xs={12} md={6}>
                {loading ? (
                    <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={isMobile ? 300 : 400}
                        sx={{
                            borderRadius: '15px',
                            transform: 'none' // removes the animation wave effect
                        }}
                    />
                ) : (

                    <Paper elevation={5} sx={{ padding: 2, textAlign: 'center', borderRadius: 3 }}>
                        <img
                            src={imagePath}
                            alt="Security"
                            style={{ width: '100%', height: 'auto', borderRadius: '10px' }}
                            onError={(e) => {
                                e.target.src = '/image/security.webp';
                            }}
                        />
                    </Paper>
                )}
            </Grid>

            {/* Content Section */}
            <Grid item xs={12} md={6}>
                <Paper elevation={5} sx={{ padding: (theme) => theme.spacing(1.5), borderRadius: 3 }}>
                    {loading ? (
                        <Skeleton
                            variant="text"
                            width="60%"
                            height={60}
                            sx={{
                                mb: 2,
                                transform: 'none'
                            }}
                        />
                    ) : (
                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                            {securityData?.title || "Security"}
                        </Typography>
                    )}

                    {loading ? (
                        Array(6).fill(0).map((_, index) => (
                            <Skeleton
                                key={index}
                                variant="text"
                                width="100%"
                                height={24}
                                sx={{
                                    mb: 2,
                                    transform: 'none'
                                }}
                            />
                        ))
                    ) : (
                        <>
                            <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary }}>
                                {introductionToDisplay}
                            </Typography>
                            {contentToDisplay.map((section, index) => (
                                <Typography
                                    key={index}
                                    variant="body1"
                                    paragraph
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    {section.content}
                                </Typography>
                            ))}
                        </>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default SecurityPage;
