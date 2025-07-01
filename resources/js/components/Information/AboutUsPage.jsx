import React, { useEffect, useState } from 'react';
import { Grid, Typography, Paper, useTheme, useMediaQuery, Box, Skeleton } from '@mui/material';
import axios from 'axios';

const AboutUsPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [aboutData, setAboutData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/portal/about_us`);
                if (response.data.success && response.data.data.length > 0) {
                    // Parse the content array from string to actual array
                    const parsedData = {
                        ...response.data.data[0],
                        content: JSON.parse(response.data.data[0].content)
                    };
                    setAboutData(parsedData);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch about us data');
            } finally {
                setLoading(false);
            }
        };

        fetchAboutData();
    }, []);

    // Fallback content if API doesn't return data
    const defaultContent = [
        "Welcome to Amo Market, your trusted partner in fast and reliable delivery services. We are dedicated to connecting local shops and markets with end-users, ensuring that you get the freshest and highest-quality products right at your doorstep.",
        "Our mission is to make your life easier by providing a seamless platform where you can purchase everyday essentials like vegetables, groceries, fruits, and more. Whether you're looking for fresh produce or pantry staples, we bring the market to you.",
        "At Amo Market, we believe in supporting local businesses and communities. By partnering with nearby shops and markets, we not only ensure quick delivery but also contribute to the growth of local economies.",
        "Our team is passionate about innovation and customer satisfaction. We are constantly working to improve our platform and services to meet your needs. With Instant Delivery, you can enjoy the convenience of shopping from home while supporting your local community.",
        "Thank you for choosing Amo Market. We look forward to serving you and making your shopping experience effortless and enjoyable."
    ];

    const contentToDisplay = aboutData?.content || defaultContent;
    const imagePath = aboutData?.image_path || '/image/about_us.webp';

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Grid container spacing={4} justifyContent="center" alignItems="center" sx={{ padding: isMobile ? 2 : 4 }}>
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
                          alt="About Us"
                            style={{ width: '100%', height: 'auto', borderRadius: '10px' }}
                            onError={(e) => {
                                e.target.src = '/image/about_us.webp';
                            }}
                        />
                    </Paper>
                )}
            </Grid>

            {/* Content Section */}
            <Grid item xs={12} md={6}>
                  <Paper elevation={5} sx={{ padding: (theme) => theme.spacing(2.4), borderRadius: 3 }}>
                    {loading ? (
                        <Skeleton
                            variant="text"
                            width="60%"
                            height={60}
                            sx={{
                                mb: 1,
                                transform: 'none'
                            }}
                        />
                    ) : (
                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                            {aboutData?.title || "About Us"}
                        </Typography>
                    )}

                    {loading ? (
                        Array(5).fill(0).map((_, index) => (
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
                        contentToDisplay.map((paragraph, index) => (
                            <Typography
                                key={index}
                                variant="body1"
                                paragraph
                                sx={{ color: theme.palette.text.secondary }}
                            >
                                {paragraph}
                            </Typography>
                        ))
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default AboutUsPage;
