import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Avatar, Box, IconButton, Button, CardMedia, Badge, Skeleton, Paper } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";

const getServiceImage = (shopType) => {
    switch (shopType) {
        case 'Car Service Center':
            return "/image/car_service.gif";
        case 'Internet Café':
            return "/image/print.gif";
        case 'Beauty Parlor':
            return "/image/beauty_parlour.gif";
        case 'TV Repair Services':
            return "/image/tv_repair.gif";
        case 'Salon / Barber Shop':
            return "/image/salon_shop.gif";
        case 'Mobile Repair Shop':
            return "/image/mobile_repair.gif";
        case 'AC Service Center':
            return "/image/ac_service.gif";
        case 'Home Appliances Store':
            return "/image/home_appliance.gif";
        default:
            return "/image/default_service.gif";
    }
};

const OrderHistoryPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL;

    // Define media queries for different screen sizes
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    // Fetch order history from API
    useEffect(() => {
        const portal_token = localStorage.getItem('portal_token');
        if (!portal_token) {
            console.log('User is not authenticated');
            return;
        }
        const fetchOrderHistory = async () => {
            try {
                const response = await fetch(`${apiUrl}/portal/order/order_history`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${portal_token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (data.status) {
                    const formattedOrders = data.data.map(order => {
                        const cartItems = JSON.parse(order.user_cart.cart_items);
                        const images = cartItems.map(item => {
                            if (item.product) {
                                return item.product.image;
                            } else if (item.service) {
                                return getServiceImage(item.service?.options?.shop_type);
                            }
                            return null;
                        }).filter(Boolean);

                        const deliveryTime = calculateDeliveryTime(order.created_at, order.updated_at);
                        return {
                            id: order.id,
                            orderId: order.order_id,
                            totalAmount: order.total_amount,
                            status: order.status,
                            createdAt: order.created_at,
                            updatedAt: order.updated_at,
                            images: images,
                            cartItems: cartItems,
                            time: deliveryTime,
                            date: new Date(order.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            }),
                        };
                    });
                    setOrders(formattedOrders);
                }
            } catch (error) {
                console.error('Error fetching order history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderHistory();
    }, [apiUrl]);

    const calculateDeliveryTime = (createdAt, updatedAt) => {
        const created = new Date(createdAt);
        const updated = new Date(updatedAt);
        const diffInMinutes = Math.floor((updated - created) / (1000 * 60));
        return `Arrived in ${diffInMinutes} minutes`;
    };

    const handleOrderSummary = (orderId) => {
        navigate(`/account/order-summary/${orderId}`);
    };

    const renderCartItems = (cartItems) => {
        return (
            <Box sx={{ display: "flex", overflowX: "auto", gap: 2 }}>
                {cartItems.map((item, index) => {
                    const isService = item.product === null && item.service !== null;
                    const serviceImage = isService ? getServiceImage(item.service?.options?.shop_type) : null;

                    return (
                        <Box
                            key={index}
                            sx={{
                                width: 60,
                                height: 60,
                                bgcolor: "#f5f5f5",
                                borderRadius: 1,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                position: 'relative',
                                flexShrink: 0
                            }}
                        >
                            {isService ? (
                                <img
                                    src={serviceImage}
                                    alt="Service"
                                    style={{ width: 40, height: 40 }}
                                />
                            ) : (
                                <img
                                    src={item.product?.image}
                                    alt={`Product ${index + 1}`}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: 'cover',
                                        borderRadius: 1
                                    }}
                                />
                            )}
                            {item.quantity > 1 && (
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: -4,
                                    right: -4,
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: 20,
                                    height: 20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem'
                                }}>
                                    {item.quantity}
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>
        );
    };

    return (
        <Container sx={{ maxWidth: '100%', padding: '0px' }} maxWidth={false}>
            <Box sx={{ padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', ml: -3 }}>
                <IconButton onClick={() => window.history.back()} >
                    <ArrowBackIcon fontSize="large" color="#9F63FF" />
                </IconButton>
                <Typography variant="h5" sx={{ color: "#646363" }} fontWeight="bold">
                    Order History
                </Typography>
            </Box>

            {/* No Order Found Message */}
            {!loading && orders.length === 0 && (
                <Paper elevation={3} sx={{ p: 4, mb: 2, mt:3, borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        No Order found!
                    </Typography>
                </Paper>
            )}

            {isMobile && (
                <Grid container spacing={2}>
                    {loading ? (
                        // Skeleton loader for mobile
                        Array.from(new Array(5)).map((_, index) => (
                            <Grid item xs={12} key={index}>
                                <Card elevation={3} style={{ borderRadius: '12px' }}>
                                    <CardContent>
                                        <Grid container alignItems="center" justifyContent="space-between">
                                            <Grid item>
                                                <Box display="flex" alignItems="center">
                                                    <Skeleton variant="circular" width={24} height={24} />
                                                    <Box ml={1}>
                                                        <Skeleton variant="text" width={100} />
                                                        <Skeleton variant="text" width={150} />
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item>
                                                <Skeleton variant="circular" width={24} height={24} />
                                            </Grid>
                                        </Grid>

                                        <Grid container spacing={1} mt={2}>
                                            {Array.from(new Array(4)).map((_, index) => (
                                                <Grid item xs={3} key={index}>
                                                    <Skeleton variant="rectangular" width={60} height={60} />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        // Actual content for mobile
                        orders.map((order) => (
                            <Grid item xs={12} key={order.id}>
                                <Card elevation={3} style={{ borderRadius: '12px' }}>
                                    <CardContent>
                                        <Grid container alignItems="center" justifyContent="space-between">
                                            <Grid item>
                                                <Box display="flex" alignItems="center">
                                                    <CheckCircleIcon color="success" />
                                                    <Box ml={1}>
                                                        <Typography variant="subtitle1">{order.time}</Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            ₹{order.totalAmount} • {order.date}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item>
                                                <IconButton onClick={() => handleOrderSummary(order.id)}>
                                                    <ArrowForwardIosIcon />
                                                </IconButton>
                                            </Grid>
                                        </Grid>

                                        <Box mt={2}>
                                            {renderCartItems(order.cartItems)}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            {isTablet && (
                <Grid container spacing={2}>
                    {loading ? (
                        Array.from(new Array(5)).map((_, index) => (
                            <Grid item xs={12} key={index}>
                                <Card elevation={3} style={{ borderRadius: '12px' }}>
                                    <CardContent>
                                        <Grid container alignItems="center" spacing={2}>
                                            <Grid item xs={3}>
                                                <Skeleton variant="rectangular" width={80} height={80} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Skeleton variant="text" width="80%" />
                                                <Skeleton variant="text" width="60%" />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Skeleton variant="rectangular" width="100%" height={40} />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        orders.map((order) => (
                            <Grid item xs={12} key={order.id}>
                                <Card elevation={3} style={{ borderRadius: '12px' }}>
                                    <CardContent>
                                        <Grid container alignItems="center" spacing={2}>
                                            <Grid item xs={3}>
                                                <Badge
                                                    badgeContent={order.cartItems.length}
                                                    color="primary"
                                                >
                                                    {order.cartItems.length > 1 ? (
                                                        <Box
                                                            sx={{
                                                                display: 'grid',
                                                                gridTemplateColumns: 'repeat(2, 1fr)',
                                                                gridTemplateRows: 'repeat(2, 1fr)',
                                                                width: 80,
                                                                height: 80,
                                                                gap: 0.1,
                                                                borderRadius: '10%',
                                                                overflow: 'hidden',
                                                            }}
                                                        >
                                                            {order.images.slice(0, 4).map((image, index) => (
                                                                <CardMedia
                                                                    key={index}
                                                                    component="img"
                                                                    sx={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover',
                                                                    }}
                                                                    image={image}
                                                                    alt={`Order Image ${index + 1}`}
                                                                />
                                                            ))}
                                                        </Box>
                                                    ) : (
                                                        <CardMedia
                                                            component="img"
                                                            sx={{ width: 80, height: 80, borderRadius: '50%' }}
                                                            image={order.images[0]}
                                                            alt="Order Image"
                                                        />
                                                    )}
                                                </Badge>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {order.orderId}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    ₹{order.totalAmount} • {order.date}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {order.time}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={() => handleOrderSummary(order.id)}
                                                >
                                                    View Details
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            {isDesktop && (
                <Box sx={{ padding: '20px' }}>
                    {loading ? (
                        Array.from(new Array(5)).map((_, index) => (
                            <Card key={index} sx={{ marginBottom: '20px', padding: '10px' }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={2}>
                                        <Skeleton variant="rectangular" width={80} height={80} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Skeleton variant="text" width={200} />
                                        <Skeleton variant="text" width={150} />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Skeleton variant="rectangular" width={100} height={30} />
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Skeleton variant="rectangular" width={100} height={30} />
                                    </Grid>
                                </Grid>
                            </Card>
                        ))
                    ) : (
                        orders.map((order) => (
                            <Card key={order.id} sx={{ marginBottom: '20px', padding: '10px' }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={2}>
                                        <Badge
                                            badgeContent={order.cartItems.length}
                                            color="primary"
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    right: 7,
                                                    top: 7,
                                                    border: '1px solid white',
                                                    padding: '0 4px',
                                                },
                                            }}
                                        >
                                            {order.cartItems.length > 1 ? (
                                                <Box
                                                    sx={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                                        gridTemplateRows: 'repeat(2, 1fr)',
                                                        width: 80,
                                                        height: 80,
                                                        gap: 0.1,
                                                        borderRadius: '10%',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {order.images.slice(0, 4).map((image, index) => (
                                                        <CardMedia
                                                            key={index}
                                                            component="img"
                                                            sx={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                            }}
                                                            image={image}
                                                            alt={`Order Image ${index + 1}`}
                                                        />
                                                    ))}
                                                </Box>
                                            ) : (
                                                <CardMedia
                                                    component="img"
                                                    sx={{ width: 80, height: 80, borderRadius: '50%' }}
                                                    image={order.images[0]}
                                                    alt="Order Image"
                                                />
                                            )}
                                        </Badge>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body1" fontWeight="bold">
                                            {order.orderId} &nbsp;·&nbsp; ₹{order.totalAmount}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Placed on {order.date}
                                        </Typography>
                                        <Typography variant="body2">
                                            {order.time}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Button variant="contained" sx={{ borderRadius: '20px', padding: '5px 10px' }} disabled>
                                            {order.status}
                                        </Button>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Button
                                            onClick={() => handleOrderSummary(order.id)}
                                            variant="outlined"
                                            color="success"
                                            size="small"
                                        >
                                            View Details
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Card>
                        ))
                    )}
                </Box>
            )}
        </Container>
    );
};

export default OrderHistoryPage;
