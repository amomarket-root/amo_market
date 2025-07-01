import React, { useEffect, useState } from 'react';
import { Grid, Typography, Paper, useTheme, useMediaQuery, Box, Skeleton, Button } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import axios from 'axios';

const ShopPageInfo = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [shopData, setShopData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/portal/shop_page`);
                if (response.data.success && response.data.data.length > 0) {
                    setShopData(response.data.data[0]);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch shop page data');
            } finally {
                setLoading(false);
            }
        };

        fetchShopData();
    }, [apiUrl]);

    // Fallback content if API doesn't return data
    const defaultContent = `As a retailer or shop owner, you can now grow your business faster with our reliable delivery network. We help you reach more customers by offering fast, efficient deliveries to all locations — saving you time and increasing your daily sales.

Our platform is designed to simplify your operations with features like real-time order tracking, automated dispatch, and easy inventory management. Whether you run a grocery store, medical shop, or any local outlet, we connect your business to a wider audience with minimal effort.

Join a trusted delivery system that not only ensures safe and timely deliveries but also supports your growth through marketing tools, customer retention programs, and business insights.

Don’t miss out on the opportunity to expand your shop’s reach. Partner with us today and experience a hassle-free way to serve more customers and grow smarter.`;

    const defaultTitle = "Partner with Us as a Retailer or Shop!";
    const defaultLink = "https://shop.amomarket.in";
    const defaultVideoUrl = "https://youtu.be/IpSQ__O814s?si=H4J6i___-ykfQK_f";

    const contentToDisplay = shopData?.content || defaultContent;
    const titleToDisplay = shopData?.title || defaultTitle;
    const linkToDisplay = shopData?.link || defaultLink;
    const videoUrlToDisplay = shopData?.video_url || defaultVideoUrl;
    const imagePath = shopData?.image_path || '/image/shop_page.webp';

    const handleVideoClick = () => {
        if (videoUrlToDisplay) {
            window.open(videoUrlToDisplay, '_blank', 'noopener,noreferrer');
        }
    };

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
                            transform: 'none'
                        }}
                    />
                ) : (
                    <Paper elevation={5} sx={{ padding: 2, textAlign: 'center', borderRadius: 3 }}>
                        <img
                            src={imagePath}
                            alt="Shop Partnership"
                            style={{ width: '100%', height: 'auto', borderRadius: '10px' }}
                            onError={(e) => {
                                e.target.src = '/image/shop_page.webp';
                            }}
                        />
                    </Paper>
                )}
            </Grid>

            {/* Content Section */}
            <Grid item xs={12} md={6}>
                <Paper elevation={5} sx={{ padding: theme.spacing(2), borderRadius: 3 }}>
                    {loading ? (
                        <>
                            <Skeleton
                                variant="text"
                                width="80%"
                                height={60}
                                sx={{ mb: 3, transform: 'none' }}
                            />
                            <Skeleton
                                variant="text"
                                width="100%"
                                height={24}
                                sx={{ mb: 2, transform: 'none' }}
                            />
                            <Skeleton
                                variant="text"
                                width="100%"
                                height={24}
                                sx={{ mb: 2, transform: 'none' }}
                            />
                            <Skeleton
                                variant="text"
                                width="100%"
                                height={24}
                                sx={{ mb: 2, transform: 'none' }}
                            />
                            <Skeleton
                                variant="rectangular"
                                width={150}
                                height={40}
                                sx={{ mt: 2, transform: 'none' }}
                            />
                        </>
                    ) : (
                        <>
                            <Typography variant="h3" gutterBottom sx={{
                                fontWeight: 'bold',
                                color: theme.palette.primary.main,
                                mb: 3
                            }}>
                                {titleToDisplay}
                            </Typography>
                            <Typography variant="body1" paragraph sx={{
                                color: theme.palette.text.secondary,
                                mb: 3,
                                whiteSpace: 'pre-line'
                            }}>
                                {contentToDisplay}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    href={linkToDisplay}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        color: 'white',
                                    }}
                                >
                                    Join Now
                                </Button>
                                {videoUrlToDisplay && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleVideoClick}
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1rem',
                                            fontWeight: 'bold'
                                        }}
                                        startIcon={<PlayCircleOutlineIcon />}
                                    >
                                        Watch Video
                                    </Button>
                                )}
                            </Box>
                        </>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default ShopPageInfo;
