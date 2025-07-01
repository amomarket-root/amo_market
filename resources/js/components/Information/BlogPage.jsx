import React, { useState, useEffect } from 'react';
import {
    Grid, Paper, CardMedia, CardContent, Typography, Button, Container,
    Pagination, Box, Chip, Select, MenuItem, FormControl, InputLabel,
    useTheme, useMediaQuery, Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BlogPage = () => {
    const theme = useTheme();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 5,
        total: 0
    });
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchBlogs();
        setCategories(['all', 'shop', 'delivery', 'customer', 'promotion', 'reward', 'product', 'service']);
    }, [selectedCategory, pagination.current_page]);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            let url = `${apiUrl}/portal/blogs?page=${pagination.current_page}&per_page=${pagination.per_page}`;
            if (selectedCategory !== 'all') {
                url += `&category=${selectedCategory}`;
            }

            const response = await axios.get(url);
            setBlogs(response.data.data.data);
            setPagination({
                current_page: response.data.data.current_page,
                last_page: response.data.data.last_page,
                per_page: response.data.data.per_page,
                total: response.data.data.total
            });
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handlePageChange = (event, page) => {
        setPagination(prev => ({ ...prev, current_page: page }));
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const renderSkeletonCard = (count = 6) => {
        return Array.from(new Array(count)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', height: '100%' }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Skeleton variant="rounded" width={60} height={24} />
                            <Skeleton variant="text" width={60} />
                        </Box>
                        <Skeleton variant="text" width="80%" height={28} />
                        <Skeleton variant="text" width="100%" height={20} />
                        <Skeleton variant="text" width="90%" height={20} />
                        <Skeleton variant="rounded" width={100} height={36} sx={{ mt: 2 }} />
                    </CardContent>
                </Paper>
            </Grid>
        ));
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Blogs
                </Typography>

                <FormControl sx={{ minWidth: 200 }} size="small">
                    <InputLabel id="category-select-label">Category</InputLabel>
                    <Select
                        labelId="category-select-label"
                        id="category-select"
                        value={selectedCategory}
                        label="Category"
                        onChange={handleCategoryChange}
                    >
                        <MenuItem value="all">All Categories</MenuItem>
                        {categories.filter(cat => cat !== 'all').map(category => (
                            <MenuItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={4} sx={{ padding: isMobile ? 2 : 4 }}>
                {loading
                    ? renderSkeletonCard(pagination.per_page)
                    : blogs.map(blog => (
                        <Grid item xs={12} sm={6} md={4} key={blog.id}>
                            <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={blog.multimedia}
                                    alt={blog.main_title}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Chip
                                            label={blog.category}
                                            color="success"
                                            variant="contained"
                                            size="small"
                                            sx={{ textTransform: 'capitalize', color: 'white' }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(blog.date)}
                                        </Typography>
                                    </Box>
                                    <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                                        {blog.main_title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {blog.header}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }} noWrap>
                                        {blog.description.substring(0, 100)}...
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="secondary"
                                        onClick={() => navigate(`/blog_details/${blog.id}`)}
                                        sx={{ mt: 'auto', color: 'white' }}
                                    >
                                        LEARN MORE
                                    </Button>
                                </CardContent>
                            </Paper>
                        </Grid>
                    ))}
            </Grid>

            {!loading && blogs.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={pagination.last_page}
                        page={pagination.current_page}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}

            {!loading && blogs.length === 0 && (
                <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                    Currently, there are no blogs available. Please check back later for updates!
                </Typography>
            )}

            {!loading && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Page {pagination.current_page} of {pagination.last_page}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Showing {blogs.length} of {pagination.total} items
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default BlogPage;
