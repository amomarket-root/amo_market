import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Link as MuiLink, IconButton, Box, Skeleton, Slide, useMediaQuery } from '@mui/material';
import { Facebook, Instagram, YouTube, LinkedIn } from '@mui/icons-material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from '../Theme/SnackbarAlert'; // Adjust path as needed

const FooterContainer = styled(Container)(({ theme }) => ({
    backgroundColor: 'white',
    marginTop: '10px',
    padding: '40px 20px',
    borderTopLeftRadius: '15px',
    borderTopRightRadius: '15px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.6)',
    overflow: 'visible',
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
    color: 'linear-gradient(to right, orange, green)',
    '& svg': {
        fontSize: '2.2rem',
    },
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'scale(1.1)',
    },
}));

const FooterLink = styled(MuiLink)(({ theme }) => ({
    color: 'black',
    textDecoration: 'none',
    '&:hover': {
        textDecoration: 'underline',
    },
}));

const Divider = styled('div')(({ theme }) => ({
    height: '4px',
    background: 'linear-gradient(to right, #9F63FF, #10d915)',
    borderRadius: 2,
    margin: '8px 0',
    width: '85%',
}));

const CategoryHeader = styled(Typography)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '& .seeAll': {
        marginLeft: 'auto',
    },
}));

const Footer = () => {
    const [showFooter, setShowFooter] = useState(false);
    const [showContactDetails, setShowContactDetails] = useState(false);
    const [showUsefulLinks, setShowUsefulLinks] = useState(false);
    const [contactData, setContactData] = useState(null);
    const [loading, setLoading] = useState(true);
    const isMobile = useMediaQuery('(max-width:600px)');
    const showSnackbar = useSnackbar();
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        setShowFooter(true);
        fetchContactData();
    }, []);

    const fetchContactData = async () => {
        try {
            const response = await axios.get(`${apiUrl}/portal/contact_us`);
            if (response.data.success && response.data.data.length > 0) {
                setContactData(response.data.data[0]);
            }
        } catch (error) {
            showSnackbar('Failed to load contact information', { severity: 'error' });
            console.error('Error fetching contact data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleContactDetails = () => {
        setShowContactDetails(!showContactDetails);
    };

    const toggleUsefulLinks = () => {
        setShowUsefulLinks(!showUsefulLinks);
    };

    return (
        <Slide direction="up" in={showFooter} timeout={1000}>
            <FooterContainer maxWidth={false}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h5" noWrap style={{ fontWeight: 'bold', color: '#9F63FF' }}>
                                Amo
                                <span style={{ color: '#10d915' }}> Market</span>
                            </Typography>
                            <Typography variant="h6" style={{ fontWeight: 'bold' }}>Smart delivery for your Location.</Typography>
                            <Box mt={2} display="flex" gap={2}>
                                <SocialIcon
                                    href={contactData?.social_media?.facebook || '#'}
                                    target="_blank"
                                    sx={{ color: '#1877F2' }} // Facebook blue
                                >
                                    <Facebook />
                                </SocialIcon>

                                <SocialIcon
                                    href={contactData?.social_media?.instagram || '#'}
                                    target="_blank"
                                    sx={{ color: '#E1306C' }} // Instagram pink
                                >
                                    <Instagram />
                                </SocialIcon>

                                <SocialIcon
                                    href={contactData?.social_media?.youtube || '#'}
                                    target="_blank"
                                    sx={{ color: '#FF0000' }} // YouTube red
                                >
                                    <YouTube />
                                </SocialIcon>

                                <SocialIcon
                                    href={contactData?.social_media?.linkedin || '#'}
                                    target="_blank"
                                    sx={{ color: '#0A66C2' }} // LinkedIn blue
                                >
                                    <LinkedIn />
                                </SocialIcon>
                            </Box>

                        </Grid>
                        <Grid item xs={12} md={4}>
                            <CategoryHeader variant="h6" gutterBottom onClick={isMobile ? toggleContactDetails : undefined} style={{ cursor: isMobile ? 'pointer' : 'default' }}>
                                Contact Us
                                {isMobile && (
                                    <Typography variant="body1" className="seeAll">
                                        {showContactDetails ? 'Hide' : 'See All'}
                                    </Typography>
                                )}
                            </CategoryHeader>
                            <Divider />
                            {(showContactDetails || !isMobile) && (
                                <>
                                    <Box mb={0.5}>
                                        {loading ? (
                                            <Skeleton variant="text" width="100%" />
                                        ) : (
                                            <Typography variant="body1">
                                                {contactData?.company_name}, {contactData?.address_line1}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box mb={0.5}>
                                        {loading ? (
                                            <Skeleton variant="text" width="100%" />
                                        ) : (
                                            <Typography variant="body1">
                                                {contactData?.address_line2}, {contactData?.city}, {contactData?.postal_code}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box mb={0.5}>
                                        {loading ? (
                                            <Skeleton variant="text" width="100%" />
                                        ) : (
                                            <Typography variant="body1">{contactData?.phone_numbers}</Typography>
                                        )}
                                    </Box>
                                    {loading ? (
                                        <Skeleton variant="text" width="100%" />
                                    ) : (
                                        <FooterLink
                                            style={{ fontWeight: 'bold' }}
                                            href={`mailto:${contactData?.email}`}
                                        >
                                            {contactData?.email}
                                        </FooterLink>
                                    )}
                                </>
                            )}
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <CategoryHeader variant="h6" gutterBottom onClick={isMobile ? toggleUsefulLinks : undefined} style={{ cursor: isMobile ? 'pointer' : 'default' }}>
                                Useful Links
                                {isMobile && (
                                    <Typography variant="body1" className="seeAll">
                                        {showUsefulLinks ? 'Hide' : 'See All'}
                                    </Typography>
                                )}
                            </CategoryHeader>
                            <Divider />
                            {(showUsefulLinks || !isMobile) && (
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        {loading ? (
                                            <Skeleton variant="text" width="100%" />
                                        ) : (
                                            <Link to="/about_us" style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <Typography variant="body1">About Us</Typography>
                                            </Link>
                                        )}
                                        {loading ? (
                                            <Skeleton variant="text" width="100%" />
                                        ) : (
                                            <Link to="/careers" style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <Typography variant="body1">Careers</Typography>
                                            </Link>
                                        )}
                                        {loading ? (
                                            <Skeleton variant="text" width="100%" />
                                        ) : (
                                            <Link to="/blog" style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <Typography variant="body1">Blog</Typography>
                                            </Link>
                                        )}
                                        {loading ? (
                                            <Skeleton variant="text" width="100%" />
                                        ) : (
                                            <Link to="/delivery-info" style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <Typography variant="body1">Deliver Info.</Typography>
                                            </Link>
                                        )}
                                    </Grid>
                                    <Grid item xs={6}>
                                        {loading ? (
                                            <Skeleton variant="text" width="100%" />
                                        ) : (
                                            <Link to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <Typography variant="body1">Privacy</Typography>
                                            </Link>
                                        )}
                                        {loading ? (
                                            <Skeleton variant="text" width="100%" />
                                        ) : (
                                            <Link to="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <Typography variant="body1">Terms</Typography>
                                            </Link>
                                        )}
                                        {loading ? (
                                            <Skeleton variant="text" width="100%" />
                                        ) : (
                                            <Link to="/security" style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <Typography variant="body1">Security</Typography>
                                            </Link>
                                        )}
                                        {loading ? (
                                            <Skeleton variant="text" width="100%" />
                                        ) : (
                                            <Link to="/shop-info" style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <Typography variant="body1">Shop Info.</Typography>
                                            </Link>
                                        )}
                                    </Grid>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Container>
            </FooterContainer>
        </Slide>
    );
};

export default Footer;
