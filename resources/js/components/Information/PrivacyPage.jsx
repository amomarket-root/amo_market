import React, { useEffect, useState } from 'react';
import { Grid, Typography, Paper, useTheme, useMediaQuery, Box, Skeleton } from '@mui/material';
import axios from 'axios';

const PrivacyPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [privacyData, setPrivacyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchPrivacyData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/portal/privacy_policy`);
                if (response.data.success && response.data.data.length > 0) {
                    // Parse the sections array from string to actual array
                    const parsedData = {
                        ...response.data.data[0],
                        sections: JSON.parse(response.data.data[0].sections)
                    };
                    setPrivacyData(parsedData);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch privacy policy data');
            } finally {
                setLoading(false);
            }
        };

        fetchPrivacyData();
    }, []);

    // Fallback content if API doesn't return data
    const defaultSections = [
        {
            title: "Information Collection",
            content: "We collect information such as your name, contact details, and delivery address to provide you with the best possible service."
        },
        {
            title: "Data Protection",
            content: "Your data is stored securely and will never be shared with third parties without your consent."
        },
        {
            title: "Security Measures",
            content: "Our team is committed to maintaining the confidentiality and integrity of your information. We continuously review and enhance our security measures to protect your data from unauthorized access."
        }
    ];

    const defaultIntroduction = "At Amo Market, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your personal information. By using our services, you agree to the practices described in this policy.";
    const defaultCompanyDescription = "Amo Market, your trusted partner in fast and reliable delivery services. We are dedicated to connecting local shops and markets with end-users, ensuring that you get the freshest and highest-quality products right at your doorstep. Our mission is to make your life easier by providing a seamless shopping experience.";

    const sectionsToDisplay = privacyData?.sections || defaultSections;
    const introductionToDisplay = privacyData?.introduction || defaultIntroduction;
    const companyDescriptionToDisplay = privacyData?.company_description || defaultCompanyDescription;
    const imagePath = privacyData?.image_path || '/image/privacy.webp';

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
                            alt="Privacy"
                            style={{ width: '100%', height: 'auto', borderRadius: '10px' }}
                            onError={(e) => {
                                e.target.src = '/image/privacy.webp';
                            }}
                        />
                    </Paper>
                )}
            </Grid>

            {/* Privacy Content Section */}
            <Grid item xs={12} md={6}>

                <Paper elevation={5} sx={{ padding: (theme) => theme.spacing(2.5), borderRadius: 3 }}>
                    {loading ? (
                        <>
                            <Skeleton
                                variant="text"
                                width="60%"
                                height={60}
                                sx={{
                                    mb: 2,
                                    transform: 'none'
                                }}
                            />
                            <Skeleton
                                variant="text"
                                width="100%"
                                height={24}
                                sx={{
                                    mb: 2,
                                    transform: 'none'
                                }}
                            />
                            <Skeleton
                                variant="text"
                                width="100%"
                                height={24}
                                sx={{
                                    mb: 2,
                                    transform: 'none'
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                {privacyData?.title || "Privacy Policy"}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {introductionToDisplay}
                            </Typography>
                            {sectionsToDisplay.map((section, index) => (
                                <div key={index}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                                        {section.title}
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        {section.content}
                                    </Typography>
                                </div>
                            ))}
                        </>
                    )}
                </Paper>
            </Grid>

            {/* Company Details Section */}
            <Grid item xs={12}>
                <Paper elevation={5} sx={{ padding: (theme) => theme.spacing(2.5), borderRadius: 3 }}>
                    {loading ? (
                        <>
                            <Skeleton
                                variant="text"
                                width="40%"
                                height={48}
                                sx={{
                                    mb: 2,
                                    transform: 'none'
                                }}
                            />
                            <Skeleton
                                variant="text"
                                width="100%"
                                height={24}
                                sx={{
                                    mb: 2,
                                    transform: 'none'
                                }}
                            />
                            <Skeleton
                                variant="text"
                                width="100%"
                                height={24}
                                sx={{
                                    mb: 2,
                                    transform: 'none'
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>
                                About Amo Market
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {companyDescriptionToDisplay}
                            </Typography>
                        </>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default PrivacyPage;
