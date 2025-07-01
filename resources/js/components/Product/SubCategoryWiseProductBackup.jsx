import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { LocationContext } from '../Location/LocationContext';
import { Container, Grid, List, ListItem, ListItemText, ListItemAvatar, Avatar, Card, CardMedia, CardContent, Typography, Button, Box, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { AccessTime, Add, Remove } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from "@mui/material/TextField";
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/system';
import Theme from '../Theme/Theme';
import { ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Skeleton from "@mui/material/Skeleton";
import LoginModal from '../Auth/LoginModal';
import { addToCart } from '../Cart/cartService';
import axios from "axios";

const StyledCard = styled(Card)(({ theme }) => ({
    height: '280px',
    display: 'flex',
    margin: '4px 2px',
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

function SubCategoryWiseProduct() {
    const navigate = useNavigate();
    const { categoryId } = useParams();
    const apiUrl = import.meta.env.VITE_API_URL;
    const isMobile = useMediaQuery('(max-width:600px)');
    const { latitude, longitude } = useContext(LocationContext);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [subcategoryProducts, setSubcategoryProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [sortBy, setSortBy] = useState('Relevance');
    const [loading, setLoading] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [noProductsMessage, setNoProductsMessage] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);

    // Fetch categories on component mount
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

        fetchCategory();
    }, [apiUrl, latitude, longitude]);

    // Memoized function to fetch products by category ID
    const fetchProductsByCategoryId = useCallback(async (categoryId, subcategoryId = null, sortBy = 'Relevance', latitude, longitude, radius = 2) => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/portal/product_by_group`, {
                params: {
                    category_id: categoryId,
                    subcategory_id: subcategoryId,
                    sort_by: sortBy,
                    latitude: latitude,
                    longitude: longitude,
                    radius: radius,
                }
            });

            if (response.data.status) {
                const data = response.data.data;
                const categoryName = response.data.data[0].name || '';
                const products = data.flatMap(item => item.sub_category.flatMap(sub => sub.product));
                const subCategories = data.flatMap(item => item.sub_category);
                subCategories.sort((a, b) => a.name.localeCompare(b.name));

                if (subcategoryId === null && subCategories.length > 0) {
                    subcategoryId = subCategories[0].id;  // Default to the first subcategory
                }

                setAllProducts(products);
                setSubcategories(subCategories);
                setSelectedCategory(categoryName);
                setSelectedSubcategory(subcategoryId);  // Ensure the first subcategory is selected
                setNoProductsMessage('');

                // Filter products based on selected subcategory
                const filteredProducts = products.filter(product =>
                    product.sub_category_id === subcategoryId
                );
                setSubcategoryProducts(filteredProducts);
            } else {
                setAllProducts([]);
                setSubcategoryProducts([]);
                setNoProductsMessage('No Products Found');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setAllProducts([]);
            setSubcategoryProducts([]);
            setNoProductsMessage('No Products Found');
        } finally {
            setLoading(false);
        }
    }, [apiUrl]);

    // Fetch products when categoryId or other dependencies change
    useEffect(() => {
        if (categoryId) {
            fetchProductsByCategoryId(categoryId, selectedSubcategory, sortBy, latitude, longitude);
        }
    }, [categoryId, selectedSubcategory, sortBy, latitude, longitude, fetchProductsByCategoryId]);

    const handleSubcategoryClick = (subcategoryId) => {
        setSelectedSubcategory(subcategoryId);
    };

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

    const handleCardClick = (productId, event) => {
        // Check if the click originated from a button with a data-action attribute
        if (event.target.getAttribute('data-action')) {
            return; // Ignore the click if it's from a button
        }
        navigate(`/product-details/${productId}`);
    };

    // Find the selected subcategory's name
    const selectedSubcategoryObject = subcategories.find(subcategory => subcategory.id === selectedSubcategory);
    const selectedSubcategoryName = selectedSubcategoryObject ? selectedSubcategoryObject.name : '';

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
                                    setSelectedSubcategory(null); // Reset selected subcategory
                                    navigate(`/all_product/subcategory/${category.id}`);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <Avatar src={category.image} alt={category.name} style={{ marginRight: '8px' }} loading="eager" decoding="async" />
                                <Typography variant="body1">
                                    {category.name}
                                </Typography>
                            </Box>
                        ))}
                    </CategoryHeader>
                </CategoryHeaderContainer>
                <Grid container spacing={1}>
                    <Grid item xs={2.5}>
                        <List>
                            {loading ? Array.from({ length: 5 }).map((_, index) => (
                                <ListItem
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "row" },
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textAlign: "center",
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Skeleton
                                            variant="rectangular"
                                            width={60}
                                            height={60}
                                            sx={{ borderRadius: 2, marginBottom: { xs: 1, sm: 0 } }}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Skeleton
                                                variant="text"
                                                width={80}
                                                height={20}
                                                sx={{ marginTop: { xs: 1, sm: 0 } }}
                                            />
                                        }
                                    />
                                </ListItem>
                            ))
                                : subcategories.map((subcategory) => (
                                    <ListItem
                                        key={subcategory.id}
                                        button
                                        selected={selectedSubcategory === subcategory.id}
                                        onClick={() => handleSubcategoryClick(subcategory.id)}
                                        sx={{
                                            display: "flex",
                                            flexDirection: { xs: "column", sm: "row" },
                                            alignItems: "center",
                                            justifyContent: "center",
                                            textAlign: "center",
                                            borderRadius: 2,
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                src={subcategory.image}
                                                variant="square"
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    marginBottom: { xs: 1, sm: 0 },
                                                    borderRadius: 2,
                                                }}
                                                loading="eager"
                                                decoding="async"
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={subcategory.name}
                                            sx={{
                                                textAlign: "center",
                                                marginTop: { xs: 1, sm: 0 },
                                            }}
                                        />
                                    </ListItem>
                                ))}
                        </List>
                    </Grid>
                    <Grid item xs={9.5}>
                        <ResponsiveHeaderBox>
                            {selectedSubcategoryName && ( // Only render if selectedSubcategoryName is truthy
                                <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                                    Buy {selectedSubcategoryName} Online
                                </Typography>
                            )}
                            <Box display="flex" gap={isMobile ? 0.5 : 1}>
                                <FormControl variant="outlined" sx={{ minWidth: isMobile ? 180 : 250 }}>
                                    {loading ? (
                                        <Skeleton variant="rectangular" width={isMobile ? 180 : 250} height={40} />
                                    ) : (
                                        <Autocomplete
                                            size="small"
                                            sx={{ width: isMobile ? 180 : 250 }}
                                            options={categories}
                                            getOptionLabel={(option) => option.name}
                                            loading={loading}
                                            value={categories.find(category => category.name === selectedCategory) || null}
                                            onChange={(event, newValue) => {
                                                if (newValue) {
                                                    setSelectedCategory(newValue.name);
                                                    fetchProductsByCategoryId(newValue.id, selectedSubcategory, sortBy, latitude, longitude);
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Choose Category"
                                                    variant="outlined"
                                                    fullWidth
                                                />
                                            )}
                                        />
                                    )}
                                </FormControl>
                                <FormControl variant="outlined" sx={{ minWidth: isMobile ? 85 : 160 }}>
                                    {loading ? (
                                        <Skeleton variant="rectangular" width={isMobile ? 85 : 160} height={40} />
                                    ) : (
                                        <>
                                            <InputLabel>Sort By</InputLabel>
                                            <Select
                                                size="small"
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                label="Sort By"
                                                sx={{ width: isMobile ? 85 : 160 }}
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
                        <Grid container spacing={0.5}> {/* Reduced spacing between cards */}
                            {loading ? (
                                Array.from(new Array(12)).map((_, index) => (
                                    <Grid item xs={6} md={3} key={index}>
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
                                    <Grid item xs={6} md={3} key={product.id}>
                                        <StyledCard key={product.id} onClick={(event) => handleCardClick(product.id, event)}>
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
                                                        <div style={{ display: 'flex', alignItems: 'center', background: 'green', borderRadius: '4px', padding: '1px 2px', color: 'white' }}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDecrease(product.id)}
                                                                style={{ color: 'white', padding: '4px' }}
                                                                data-action="decrease" // Add a custom attribute
                                                            >
                                                                <Remove />
                                                            </IconButton>
                                                            <Typography variant="body2" component="div" style={{ margin: '0 6px', color: 'white' }}>
                                                                {product.count}
                                                            </Typography>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleIncrease(product.id)}
                                                                style={{ color: 'white', padding: '2px' }}
                                                                data-action="increase" // Add a custom attribute
                                                            >
                                                                <Add />
                                                            </IconButton>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            color="success"
                                                            onClick={() => handleAdd(product.id)}
                                                            style={{ height: '36px', minWidth: '64px' }}
                                                            data-action="add" // Add a custom attribute
                                                        >
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
                                    <img src='/image/not_found.png' alt="No Products Found" style={{ maxWidth: '100%', maxHeight: '400px', margin: '20px 0' }} loading="eager" decoding="async" />
                                    <Typography variant="h5" color="textSecondary" style={{ fontWeight: 'bold' }}>
                                        {noProductsMessage || 'No Products Found'}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
                {/* Render LoginModal */}
                <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
            </ThemeProvider>
        </Container>
    );
}

export default SubCategoryWiseProduct;
