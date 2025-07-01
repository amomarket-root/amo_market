import React, { useEffect, useState } from 'react';
import { Grid, Typography, Paper, useTheme, useMediaQuery, Box, Skeleton } from '@mui/material';
import axios from 'axios';

const TermsPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [termsData, setTermsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchTermsData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/portal/terms`);
                if (response.data.success && response.data.data.length > 0) {
                    setTermsData(response.data.data[0]);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch terms and conditions data');
            } finally {
                setLoading(false);
            }
        };

        fetchTermsData();
    }, []);

    // Fallback content if API doesn't return data
    const defaultContent = [
        "Welcome to Amo Market, These Terms and Conditions outline the rules and regulations for the use of our services. By accessing or using our services, you agree to comply with these terms.",
        "We reserve the right to modify these terms at any time. It is your responsibility to review these terms periodically for any changes. Your continued use of our services after any modifications constitutes acceptance of the new terms.",
        "You agree to provide accurate and complete information when using our services. Any false or misleading information may result in the suspension or termination of your account.",
        "Amo Market is not liable for any damages or losses resulting from your use of our services. We strive to provide a seamless experience, but we cannot guarantee uninterrupted access or error-free services.",
        "If you have any questions or concerns regarding these Terms and Conditions, please feel free to contact us."
    ];

    const contentToDisplay = termsData?.content ? termsData.content.split('\n\n') : defaultContent;
    const imagePath = termsData?.image_path || '/image/terms.webp';

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
                            borderRadius: '8px',
                            transform: 'none' // removes the animation wave effect
                        }}
                    />
                ) : (
                    <Paper elevation={5} sx={{ padding: 2, textAlign: 'center', borderRadius: 3 }}>
                        <img
                            src={imagePath}
                            alt="Terms"
                            style={{ width: '100%', height: 'auto', borderRadius: '10px' }}
                            onError={(e) => {
                                e.target.src = '/image/terms.webp';
                            }}
                        />
                    </Paper>
                )}
            </Grid>

            {/* Terms Content Section */}
            <Grid item xs={12} md={6}>
                <Paper elevation={5} sx={{ padding: theme.spacing(2), borderRadius: 3 }}>
                    {loading ? (
                        <>
                            <Skeleton
                                variant="text"
                                width="60%"
                                height={60}
                                sx={{
                                    mb: 1,
                                    transform: 'none'
                                }}
                            />
                            {[...Array(5)].map((_, index) => (
                                <Skeleton
                                    key={index}
                                    variant="text"
                                    width="100%"
                                    height={24}
                                    sx={{
                                        mb: 1,
                                        transform: 'none'
                                    }}
                                />
                            ))}
                        </>
                    ) : (
                        <>
                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                {termsData?.title || "Terms and Conditions"}
                            </Typography>
                            {contentToDisplay.map((paragraph, index) => (
                                <Typography
                                    key={index}
                                    variant="body1"
                                    paragraph
                                >
                                    {paragraph}
                                </Typography>
                            ))}
                        </>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default TermsPage;
