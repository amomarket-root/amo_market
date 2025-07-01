import React, { useState, useEffect, useContext } from 'react';
import { useParams } from "react-router-dom";
import { Container, Grid, Card, CardMedia, CardContent, Typography, Button, Select, MenuItem, FormControl, InputLabel, Box, IconButton } from '@mui/material';
import { AccessTime, Add, Remove } from '@mui/icons-material';
import { LocationContext } from '../Location/LocationContext';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/system';
import Theme from '../Theme/Theme';
import { ThemeProvider } from '@mui/material/styles';
import Skeleton from "@mui/material/Skeleton";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { addToCart } from '../Cart/cartService';
import LoginModal from '../Auth/LoginModal';


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
    marginTop: '5px',
    marginBottom: '10px',
    flexDirection: 'row', // Default for desktop
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column', // Stack items vertically on mobile
        alignItems: 'flex-start', // Align items to the start on mobile
        gap: '8px',
    },
}));

const NotFoundDescription = styled(Typography)(({ theme }) => ({
    fontSize: '1.2rem',
    color: '#777',
    marginBottom: '20px',
    [theme.breakpoints.down('md')]: {
        fontSize: '1rem',
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.9rem',
    },
}));

const GoHomeButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#10d915',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '5px',
    fontSize: '1.2rem',
    transition: 'background-color 0.3s ease',
    textDecoration: 'none',
    '&:hover': {
        backgroundColor: '#0db311',
    },
    [theme.breakpoints.down('md')]: {
        fontSize: '1rem',
        padding: '8px 16px',
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.9rem',
        padding: '7px 14px',
    },
}));

function ShopProductList() {
    const navigate = useNavigate();
    const { shopId } = useParams();
    const { latitude, longitude } = useContext(LocationContext);
    const apiUrl = import.meta.env.VITE_API_URL;
    const [selectedShop, setSelectedShop] = useState('');
    const [sortBy, setSortBy] = useState('Relevance');
    const [shopProducts, setShopProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [noProductsMessage, setNoProductsMessage] = useState('');
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    const fetchProductsByShopId = async (shopId, sortBy, apiUrl, latitude, longitude, radius = 2) => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/portal/product_by_shop_id`, {
                params: {
                    shop_id: shopId,
                    sort_by: sortBy,
                    latitude: latitude,
                    longitude: longitude,
                    radius: radius,
                },
            });

            if (response.data.status) {
                const products = response.data.data.map(product => ({
                    ...product,
                    count: product.count || 0 // Initialize count for each product
                }));
                const shopName = response.data.data[0]?.shop_name || '';
                setShopProducts(products);
                setSelectedShop(shopName);
                setNoProductsMessage('');
            } else {
                setShopProducts([]);
                setNoProductsMessage('No Products Found');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setShopProducts([]);
            setNoProductsMessage('No Products Found');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (shopId && latitude && longitude) {
            fetchProductsByShopId(shopId, sortBy, apiUrl, latitude, longitude);
        }
    }, [shopId, sortBy, apiUrl, latitude, longitude]);

    const handleAdd = async (id) => {
        const portal_token = localStorage.getItem('portal_token');
        if (!portal_token) {
            setLoginModalOpen(true); // Open LoginModal if not authenticated
            return;
        }

        setShopProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === id ? { ...product, count: 1 } : product
            )
        );
        await addToCart(id, 1);
        window.dispatchEvent(new Event('cartChange'));
    };

    const handleIncrease = async (id) => {
        const portal_token = localStorage.getItem('portal_token');
        if (!portal_token) {
            setLoginModalOpen(true); // Open LoginModal if not authenticated
            return;
        }

        setShopProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === id ? { ...product, count: product.count + 1 } : product
            )
        );
        await addToCart(id, 1);
        window.dispatchEvent(new Event('cartChange'));
    };

    const handleDecrease = async (id) => {
        const portal_token = localStorage.getItem('portal_token');
        if (!portal_token) {
            setLoginModalOpen(true); // Open LoginModal if not authenticated
            return;
        }

        setShopProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === id && product.count > 0
                    ? { ...product, count: product.count - 1 }
                    : product
            )
        );
        await addToCart(id, -1);
        window.dispatchEvent(new Event('cartChange'));
    };

    const handleCardClick = (productId) => {
        navigate(`/product-details/${productId}`);
    };

    return (
        <Container sx={{ maxWidth: '100%', padding: '0px' }} maxWidth={false}>
            <ThemeProvider theme={Theme}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <ResponsiveHeaderBox>
                            {selectedShop && (
                                <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                                    Products from {selectedShop}
                                </Typography>
                            )}
                            {shopProducts.length > 0 && (
                                <Box display="flex" gap={1} sx={{
                                    width: { xs: '100%', sm: 'auto' },
                                    justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                                }}>
                                    <FormControl variant="outlined" sx={{
                                        minWidth: 230,
                                        width: { xs: '100%', sm: 230 }
                                    }}>
                                        {loading ? (
                                            <Skeleton variant="rectangular" height={35} />
                                        ) : (
                                            <>
                                                <InputLabel>Sort By</InputLabel>
                                                <Select
                                                    size="small"
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                    label="Sort By"
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
                            )}
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
                            ) : shopProducts.length > 0 ? (
                                shopProducts.map((product) => (
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
                                    <Typography variant="h5" color="#f27474" style={{ fontWeight: 'bold' }}>
                                        {noProductsMessage}
                                    </Typography>
                                    <NotFoundDescription variant="body1">
                                        Oops! No products available right now. Exciting arrivals are coming soon!
                                    </NotFoundDescription>
                                    <GoHomeButton
                                        variant="contained"
                                        onClick={() => window.history.back()}
                                        style={{ marginTop: 10 }}
                                    >
                                        Go Back
                                    </GoHomeButton>
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

export default ShopProductList;
