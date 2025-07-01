import React, { useState, useEffect, useContext } from 'react';
import { useParams } from "react-router-dom";
import { Container, Grid, Card, CardMedia, CardContent, Typography, Button, Select, MenuItem, FormControl, InputLabel, Box, IconButton, Avatar } from '@mui/material';
import { AccessTime, Add, Remove } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import { LocationContext } from '../Location/LocationContext';
import TextField from "@mui/material/TextField";
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/system';
import Theme from '../Theme/Theme';
import { ThemeProvider } from '@mui/material/styles';
import Skeleton from "@mui/material/Skeleton";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import LoginModal from '../Auth/LoginModal';
import { addToCart } from '../Cart/cartService';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '280px',
    display: 'flex',
    margin: '8px 4px',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.3)',
    },
}));

const CategoryHeaderContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#dbdbdb',
    padding: '5px 20px',
    overflowX: 'auto',
    '&::-webkit-scrollbar': {
        height: '2px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(to right, #2EDF0F, #7528FA)',
        borderRadius: '4px',
    },
    whiteSpace: 'nowrap',
    borderRadius: '15px',
}));

const CategoryHeader = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    marginRight: '10px',
    '& > *': {
        marginRight: '10px',
        cursor: 'pointer',
        fontSize: '16px',
        color: '#333',
        textDecoration: 'none',
        '&:hover': {
            color: theme.palette.primary.main,
        }
    },
}));

const ResponsiveHeaderBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '5px',
    marginTop: '24px',
    marginBottom: '16px',
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px',
    },
}));

function AllProduct() {
    const navigate = useNavigate();
    const { categoryId } = useParams();
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const { latitude, longitude } = useContext(LocationContext);
    const apiUrl = import.meta.env.VITE_API_URL;
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [sortBy, setSortBy] = useState('Relevance');
    const [subcategoryProducts, setSubcategoryProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [noProductsMessage, setNoProductsMessage] = useState('');
    const [locationLoaded, setLocationLoaded] = useState(false);

    useEffect(() => {
        const fetchCategory = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${apiUrl}/portal/category`, {
                    params: { latitude, longitude },
                });
                setCategories(response.data.data);
            } catch (error) {
                console.error('Error fetching category:', error);
            } finally {
                setLoading(false);
            }
        };

        if (latitude && longitude) {
            fetchCategory();
            setLocationLoaded(true);
        }
    }, [latitude, longitude, apiUrl]);

    const fetchProductsByCategoryId = async (categoryId, sortBy, apiUrl, latitude, longitude, radius = 2) => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/portal/product_by_id`, {
                params: {
                    category_id: categoryId,
                    sort_by: sortBy,
                    latitude: latitude,
                    longitude: longitude,
                    radius: radius,
                },
            });

            if (response.data.status) {
                const products = response.data.data;
                const categoryName = response.data.data[0]?.sub_category?.category?.name || '';
                setSubcategoryProducts(products);
                setSelectedCategory(categoryName);
                setNoProductsMessage('');
            } else {
                setSubcategoryProducts([]);
                setNoProductsMessage('No Products Found');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setSubcategoryProducts([]);
            setNoProductsMessage('No Products Found');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (categoryId && latitude && longitude && locationLoaded) {
            fetchProductsByCategoryId(categoryId, sortBy, apiUrl, latitude, longitude);
        }
    }, [categoryId, sortBy, apiUrl, latitude, longitude, locationLoaded]);

    const handleAdd = async (id) => {
        const portal_token = localStorage.getItem('portal_token');
        if (!portal_token) {
            setLoginModalOpen(true); // Open LoginModal if not authenticated
            return;
        }
        setSubcategoryProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === id ? { ...product, count: 1 } : product
            )
        );
        await addToCart(id, 1); // Add the product to the cart
        window.dispatchEvent(new Event('cartChange')); // Trigger cart change event
    };

    const handleIncrease = async (id) => {
        setSubcategoryProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === id ? { ...product, count: product.count + 1 } : product
            )
        );
        await addToCart(id, 1); // Increase the product quantity in the cart
        window.dispatchEvent(new Event('cartChange')); // Trigger cart change event
    };

    const handleDecrease = async (id) => {
        setSubcategoryProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === id && product.count > 0
                    ? { ...product, count: product.count - 1 }
                    : product
            )
        );
        await addToCart(id, -1); // Decrease the product quantity in the cart
        window.dispatchEvent(new Event('cartChange')); // Trigger cart change event
    };

    const handleCardClick = (productId) => {
        navigate(`/product-details/${productId}`);
    };

    return (
        <Container sx={{ maxWidth: '100%', padding: '0px' }} maxWidth={false}>
            <ThemeProvider theme={Theme}>
                <CategoryHeaderContainer>
                    <CategoryHeader>
                        {categories.map((category) => (
                            <Box
                                key={category.id}
                                display="flex"
                                alignItems="center"
                                onClick={() => {
                                    navigate(`/all_product/subcategory/${category.id}`);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <Avatar src={category.image} alt={category.name} style={{ marginRight: '8px' }} />
                                <Typography variant="body1">
                                    {category.name}
                                </Typography>
                            </Box>
                        ))}
                    </CategoryHeader>
                </CategoryHeaderContainer>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <ResponsiveHeaderBox>
                            {selectedCategory && ( // Only render if selectedCategory is truthy
                                <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                                    Buy {selectedCategory} Online
                                </Typography>
                            )}
                            <Box display="flex" gap={1}>
                                <FormControl variant="outlined" sx={{ minWidth: 210 }}>
                                    {loading ? (
                                        <Skeleton variant="rectangular" width={210} height={40} />
                                    ) : (
                                        <Autocomplete
                                            size="small"
                                            sx={{ width: 210 }}
                                            options={categories}
                                            getOptionLabel={(option) => option.name}
                                            loading={loading}
                                            value={categories.find(category => category.name === selectedCategory) || null}
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    setSelectedCategory(newValue.name);
                                                    fetchProductsByCategoryId(newValue.id, sortBy, apiUrl, latitude, longitude);
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Choose Other Category"
                                                    variant="outlined"
                                                    fullWidth
                                                />
                                            )}
                                        />
                                    )}
                                </FormControl>
                                <FormControl variant="outlined" sx={{ minWidth: 100 }}>
                                    {loading ? (
                                        <Skeleton variant="rectangular" width={100} height={40} />
                                    ) : (
                                        <>
                                            <InputLabel>Sort By</InputLabel>
                                            <Select
                                                size="small"
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                label="Sort By"
                                                sx={{ width: 100 }}
                                            >
                                                <MenuItem value="Relevance">Relevance</MenuItem>
                                                <MenuItem value="Price(L-H)">Price(Low to High)</MenuItem>
                                                <MenuItem value="Price(H-L)">Price(High to Low)</MenuItem>
                                                <MenuItem value="discount">Discount(High to Low)</MenuItem>
                                            </Select>
                                        </>
                                    )}
                                </FormControl>
                            </Box>
                        </ResponsiveHeaderBox>

                        <Grid container>
                            {loading ? (
                                Array.from(new Array(12)).map((_, index) => (
                                    <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                                        <StyledCard>
                                            <Skeleton variant="rectangular" height={120} />
                                            <CardContent style={{ padding: '10px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <Skeleton variant="text" height={24} width="80%" />
                                                <Skeleton variant="text" height={20} width="60%" />
                                                <Skeleton variant="text" height={20} width="60%" />
                                                <Skeleton variant="text" height={36} width="50%" style={{ marginTop: '8px' }} />
                                            </CardContent>
                                        </StyledCard>
                                    </Grid>
                                ))
                            ) : subcategoryProducts.length > 0 ? (
                                subcategoryProducts.map((product) => (
                                    <Grid item xs={6} sm={4} md={3} lg={2} key={product.id}>
                                        <StyledCard key={product.id} onClick={() => handleCardClick(product.id)}>
                                            {product.discount != 'null' && product.discount != null && product.discount !== 0 && (
                                                <Typography
                                                    style={{
                                                        position: 'absolute',
                                                        background: 'rgba(0, 123, 255, 0.9)',
                                                        color: 'white',
                                                        padding: '2px 5px',
                                                        borderRadius: '0 0 5px 5px',
                                                        top: 0,
                                                        right: 0
                                                    }}
                                                >
                                                    {product.discount} OFF
                                                </Typography>
                                            )}
                                            <CardMedia
                                                component="img"
                                                height="140"
                                                image={product.image}
                                                alt={product.name}
                                                style={{ objectFit: 'contain' }}
                                                loading="eager"
                                                decoding="async"
                                            />
                                            <CardContent style={{ padding: '10px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <div>
                                                    <Typography variant="body2" color="textSecondary" style={{ lineHeight: '24px', display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                        <AccessTime style={{ marginRight: '5px', fontSize: '20px', verticalAlign: 'sub' }} /> {product.delivery_time} min.
                                                    </Typography>
                                                    <Tooltip title={product.name}>
                                                        <Typography
                                                            variant="body2"
                                                            component="div"
                                                            style={{
                                                                fontWeight: 'bold',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                maxWidth: '100%'
                                                            }}
                                                        >
                                                            {product.name}
                                                        </Typography>
                                                    </Tooltip>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {product.volume}
                                                    </Typography>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                                    <Typography variant="body2" color="text.primary">
                                                        {product.price}
                                                    </Typography>
                                                    {product.count > 0 ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', background: 'green', borderRadius: '4px', padding: '2px 4px', color: 'white' }}>
                                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDecrease(product.id); }} style={{ color: 'white', padding: '4px' }}>
                                                                <Remove />
                                                            </IconButton>
                                                            <Typography variant="body2" component="div" style={{ margin: '0 8px', color: 'white' }}>
                                                                {product.count}
                                                            </Typography>
                                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleIncrease(product.id); }} style={{ color: 'white', padding: '4px' }}>
                                                                <Add />
                                                            </IconButton>
                                                        </div>
                                                    ) : (
                                                        <Button variant="outlined" size="small" color="success" onClick={(e) => { e.stopPropagation(); handleAdd(product.id); }} style={{ height: '36px', minWidth: '64px' }}>
                                                            Add
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </StyledCard>
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12} style={{ textAlign: 'center' }}>
                                    <img src='/image/product_not_found.webp' alt="No Products Found" style={{ maxWidth: '100%', maxHeight: '400px', margin: '20px 0' }} loading="eager" decoding="async" />
                                    <Typography variant="h5" color="textSecondary" style={{ fontWeight: 'bold' }}>
                                        {noProductsMessage || 'No Products Found'}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </ThemeProvider>
            {/* Render LoginModal */}
            <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
        </Container>
    );
}

export default AllProduct;
