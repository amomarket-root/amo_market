import React, { useEffect, useState } from 'react';
import { Grid, Typography, Paper, useTheme, useMediaQuery, Box, Skeleton, Button } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import axios from 'axios';

const DeliveryPageInfo = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [deliveryData, setDeliveryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchDeliveryData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/portal/delivery_page`);
                if (response.data.success && response.data.data.length > 0) {
                    setDeliveryData(response.data.data[0]);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch delivery page data');
            } finally {
                setLoading(false);
            }
        };

        fetchDeliveryData();
    }, [apiUrl]);

    // Fallback content if API doesn't return data
    const defaultContent = `We offer fast, reliable delivery services to all locations and invite shop owners and retailers to join our growing network. Partnering with us helps you expand your reach, boost sales, and serve more customers with ease. Whether you run a grocery store, pharmacy, or local outlet, our platform connects your store to a wide customer base and ensures quick, efficient deliveries.

Our system supports businesses of all sizes with real-time tracking, automated dispatch, and seamless order management. You'll get full visibility and professional delivery service that reflects well on your brand.

Enjoy added benefits like targeted marketing, promotional support, and flexible partnership options. Whether you're starting out or already established, we're here to support your growth.

Join us today and grow your business with a trusted delivery partner by your side.`;

    const defaultTitle = "Become a Delivery Partner with Us!";
    const defaultLink = "https://delivery.amomarket.in";
    const defaultVideoUrl = "https://youtu.be/example-video-id";

    const contentToDisplay = deliveryData?.content || defaultContent;
    const titleToDisplay = deliveryData?.title || defaultTitle;
    const linkToDisplay = deliveryData?.link || defaultLink;
    const videoUrlToDisplay = deliveryData?.video_url || defaultVideoUrl;
    const imagePath = deliveryData?.image_path || '/image/delivery_page.webp';

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
                    <Paper elevation={5} sx={{
                        padding: 2,
                        textAlign: 'center',
                        borderRadius: 3,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img
                            src={imagePath}
                            alt="Delivery Partnership"
                            style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: '10px',
                                maxHeight: isMobile ? '300px' : '400px',
                                objectFit: 'cover'
                            }}
                            onError={(e) => {
                                e.target.src = '/image/delivery_page.webp';
                            }}
                        />
                    </Paper>
                )}
            </Grid>

            {/* Content Section */}
            <Grid item xs={12} md={6}>
                <Paper elevation={5} sx={{
                    padding: theme.spacing(2),
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
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
                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 2,
                                textAlign: isMobile ? 'center' : 'left'
                            }}>
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
                                        color: 'white'
                                    }}
                                >
                                    Apply Now
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

export default DeliveryPageInfo;
