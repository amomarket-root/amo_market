import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CardMedia, Chip, Grid, IconButton, useTheme, useMediaQuery, Paper, Skeleton, Popover, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import { Avatar } from '@mui/material';
import axios from 'axios';
import ShareIcon from '@mui/icons-material/Share';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InstagramIcon from '@mui/icons-material/Instagram';

import {
    FacebookShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    LinkedinShareButton,
    FacebookIcon,
    TwitterIcon,
    WhatsappIcon,
    LinkedinIcon,
} from 'react-share';

const BlogDetailsPage = () => {
    const { blogId } = useParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchBlogDetails = async () => {
            try {
                const response = await axios.get(`${apiUrl}/portal/blog/${blogId}`);
                setBlog(response.data.data);
            } catch (error) {
                console.error('Error fetching blog details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogDetails();
    }, [blogId]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const parseImageArray = (str) => {
        try {
            return JSON.parse(str);
        } catch {
            return [];
        }
    };

    const handleShareClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleShareClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const shareUrl = window.location.href;

    return (
        <Container maxWidth="xl" sx={{ py: isMobile ? 2 : 4 }}>
            <Paper
                elevation={5}
                sx={{
                    padding: isMobile ? 2 : 4,
                    borderRadius: 3,
                    backgroundColor: '#fff',
                }}
            >
                {/* Title */}
                {loading ? (
                    <Skeleton variant="text" height={40} width="80%" />
                ) : (
                    <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight="bold" sx={{ mb: 5 }} gutterBottom>
                        {blog.main_title}
                    </Typography>
                )}

                {/* Date, Location, Share (Responsive Grid) */}
                <Grid container alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={9} sm={10}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {loading ? (
                                <Skeleton width={100} />
                            ) : (
                                <Typography variant="h6" color="text.secondary">
                                    {formatDate(blog.date)}
                                </Typography>
                            )}

                            {loading ? (
                                <Skeleton width={120} />
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocationOnIcon fontSize="medium" />
                                    <Typography variant="h6" color="text.secondary">{blog.location}</Typography>
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={3} sm={2} textAlign="right">
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ShareIcon />}
                            onClick={handleShareClick}
                        >
                            Share
                        </Button>

                        <Popover
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handleShareClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 1.5, p: 2 }}>
                                <FacebookShareButton url={shareUrl}>
                                    <FacebookIcon size={32} round />
                                </FacebookShareButton>

                                <TwitterShareButton url={shareUrl}>
                                    <TwitterIcon size={32} round />
                                </TwitterShareButton>

                                <WhatsappShareButton url={shareUrl}>
                                    <WhatsappIcon size={32} round />
                                </WhatsappShareButton>

                                <LinkedinShareButton url={shareUrl}>
                                    <LinkedinIcon size={32} round />
                                </LinkedinShareButton>

                                {/* Instagram inside Avatar */}
                                <IconButton
                                    onClick={() => window.open('https://www.instagram.com/', '_blank')}
                                    sx={{ p: 0, mb:0.5 }}
                                >
                                    <Avatar
                                        sx={{
                                            bgcolor: '#E1306C',
                                            width: 32,
                                            height: 32,
                                        }}
                                    >
                                        <InstagramIcon sx={{ fontSize: 18, color: '#fff' }} />
                                    </Avatar>
                                </IconButton>
                            </Box>

                        </Popover>
                    </Grid>
                </Grid>

                {/* Banner Image */}
                {loading ? (
                    <Skeleton variant="rectangular" width="100%" height={isMobile ? 200 : 400} sx={{ borderRadius: 2, mb: 3 }} />
                ) : (
                    <CardMedia
                        component="img"
                        image={blog.multimedia}
                        alt={blog.main_title}
                        sx={{
                            width: '100%',
                            borderRadius: 2,
                            objectFit: 'cover',
                            mb: 3,
                        }}
                    />
                )}

                {/* Category Chip */}
                {loading ? (
                    <Skeleton width={80} height={30} sx={{ mb: 2 }} />
                ) : (
                    <Chip
                        label={blog.category}
                        size="small"
                        color="primary"
                        sx={{ mb: 2, textTransform: 'capitalize' }}
                    />
                )}

                {/* Header */}
                {loading ? (
                    <Skeleton variant="text" width="60%" height={30} sx={{ mb: 1 }} />
                ) : (
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                        {blog.header}
                    </Typography>
                )}

                {/* Description */}
                {loading ? (
                    <Skeleton variant="rectangular" height={150} sx={{ mb: 3 }} />
                ) : (
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                        {blog.description}
                    </Typography>
                )}

                {/* Additional Images */}
                {!loading && parseImageArray(blog.other_images).length > 0 && (
                    <>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 5 }} gutterBottom>
                            Image Library
                        </Typography>
                        <Grid container spacing={2}>
                            {parseImageArray(blog.other_images).map((img, index) => (
                                <Grid item xs={6} sm={4} md={3} key={index}>
                                    <CardMedia
                                        component="img"
                                        image={img}
                                        alt={`Other Image ${index + 1}`}
                                        sx={{ borderRadius: 2, objectFit: 'cover' }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default BlogDetailsPage;
