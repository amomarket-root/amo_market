import React, { useEffect, useState } from 'react';
import { Grid, Typography, Paper, useTheme, useMediaQuery, Button, Box, Skeleton } from '@mui/material';
import axios from 'axios';

const CareersPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [careersData, setCareersData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchCareersData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/portal/careers`);
                if (response.data.success && response.data.data.length > 0) {
                    // Parse benefits if they exist and are in string format
                    const parsedData = response.data.data.map(item => ({
                        ...item,
                        benefits: item.benefits ? JSON.parse(item.benefits) : null
                    }));
                    // Sort by sort_order
                    parsedData.sort((a, b) => a.sort_order - b.sort_order);
                    setCareersData(parsedData);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch careers data');
            } finally {
                setLoading(false);
            }
        };

        fetchCareersData();
    }, []);

    // Fallback content if API doesn't return data
    const defaultCareersData = [
        {
            title: "Marketing Specialist",
            description: "Seeking a creative Marketing Specialist to develop and execute strategies that engage customers and promote our services.",
            email: "careers@amomarket.com",
            benefits: [
                "Opportunities for professional development",
                "Dynamic work environment",
                "Competitive salaries",
                "Make a real impact"
            ]
        },
        {
            title: "Software Developer",
            description: "Join us as a Software Developer to build scalable solutions and enhance user experiences with cutting-edge technology.",
            email: "careers@amomarket.com",
            benefits: null
        },
        {
            title: "Customer Support Executive",
            description: "Looking for skilled communicators to assist our users with top-notch support.",
            email: "careers@amomarket.com",
            benefits: null
        },
        {
            title: "Delivery Partner",
            description: "Ensure timely deliveries with flexible hours and competitive earnings.",
            email: "careers@amomarket.com",
            benefits: null
        }
    ];

    const defaultIntro = "Join Amo Market and be part of an innovative, fast-growing team. Explore our openings and take the next step in your career.";
    const defaultWhyWork = "At Amo Market, we believe in fostering a culture of growth, collaboration, and innovation. Here's why you should consider joining us:";
    const defaultBenefits = [
        "Opportunities for professional development and career growth.",
        "A dynamic and inclusive work environment.",
        "Competitive salaries and benefits.",
        "The chance to make a real impact in a fast-growing company."
    ];

    const careersToDisplay = careersData || defaultCareersData;
    const introToDisplay = careersData?.length ? "Join Amo Market and be part of an innovative, fast-growing team. Explore our openings and take the next step in your career." : defaultIntro;
    const whyWorkToDisplay = careersData?.length ? "At Amo Market, we believe in fostering a culture of growth, collaboration, and innovation. Here's why you should consider joining us:" : defaultWhyWork;
    const benefitsToDisplay = careersData?.find(item => item.benefits)?.benefits || defaultBenefits;
    const contactEmail = careersData?.[0]?.email || "careers@amomarket.com";
    const imagePath = careersData?.find(item => item.image_path)?.image_path || '/image/career-progress.webp';

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
                            transform: 'none'
                        }}
                    />
                ) : (
                    <Paper elevation={5} sx={{ padding: 2, textAlign: 'center', borderRadius: 3 }}>
                        <img
                            src={imagePath}
                            alt="Careers"
                            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                            onError={(e) => {
                                e.target.src = '/image/career-progress.webp';
                            }}
                        />
                    </Paper>
                )}
            </Grid>

            {/* Careers Content Section */}
            <Grid item xs={12} md={6}>
                <Paper elevation={5} sx={{ padding: (theme) => theme.spacing(1.5), borderRadius: 3 }}>
                    {loading ? (
                        <>
                            <Skeleton
                                variant="text"
                                width="60%"
                                height={60}
                                sx={{ mb: 2, transform: 'none' }}
                            />
                            <Skeleton
                                variant="text"
                                width="100%"
                                height={24}
                                sx={{ mb: 2, transform: 'none' }}
                            />
                            {[...Array(4)].map((_, i) => (
                                <Box key={i} sx={{ marginBottom: 2 }}>
                                    <Skeleton
                                        variant="text"
                                        width="40%"
                                        height={40}
                                        sx={{ mb: 1, transform: 'none' }}
                                    />
                                    <Skeleton
                                        variant="text"
                                        width="100%"
                                        height={24}
                                        sx={{ mb: 1, transform: 'none' }}
                                    />
                                    <Skeleton
                                        variant="text"
                                        width="90%"
                                        height={24}
                                        sx={{ transform: 'none' }}
                                    />
                                </Box>
                            ))}
                        </>
                    ) : (
                        <>
                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                Careers at Amo Market
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {introToDisplay}
                            </Typography>

                            {careersToDisplay.map((job, index) => (
                                <Box key={index} sx={{ marginBottom: 2 }}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>
                                        {job.title}
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        {job.description}
                                    </Typography>
                                </Box>
                            ))}

                            <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
                                Interested? Send your resume to:
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                href={`mailto:${contactEmail}`}
                                sx={{ marginTop: 1 }}
                            >
                                {contactEmail}
                            </Button>
                        </>
                    )}
                </Paper>
            </Grid>

            {/* Company Details Section */}
            <Grid item xs={12}>
                <Paper elevation={5} sx={{ padding: (theme) => theme.spacing(3), borderRadius: 3 }}>
                    {loading ? (
                        <>
                            <Skeleton
                                variant="text"
                                width="40%"
                                height={48}
                                sx={{ mb: 2, transform: 'none' }}
                            />
                            <Skeleton
                                variant="text"
                                width="100%"
                                height={24}
                                sx={{ mb: 2, transform: 'none' }}
                            />
                            {[...Array(4)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    variant="text"
                                    width="80%"
                                    height={24}
                                    sx={{ mb: 1, transform: 'none' }}
                                />
                            ))}
                        </>
                    ) : (
                        <>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>
                                Why Work at Amo Market?
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {whyWorkToDisplay}
                            </Typography>
                            <Typography variant="body1" component="ul" paragraph>
                                {benefitsToDisplay.map((benefit, index) => (
                                    <li key={index}>{benefit}</li>
                                ))}
                            </Typography>
                        </>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default CareersPage;
