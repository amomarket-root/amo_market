import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Card, CardContent, Avatar, Button, Divider, IconButton,
    Rating, Dialog, AppBar, Toolbar, Slide, useMediaQuery, Skeleton, Tooltip,
    TextField, Chip, Tabs, Tab
} from '@mui/material';
import { Phone, Home, Report, HelpOutline, ArrowBack, Store } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../Theme/SnackbarAlert';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const UserFeedback = ({ open, onClose, orderId }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [shopRatings, setShopRatings] = useState({});
    const [deliveryRating, setDeliveryRating] = useState(0);
    const [packagingFeedbacks, setPackagingFeedbacks] = useState({});
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const showSnackbar = useSnackbar();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const apiUrl = import.meta.env.VITE_API_URL;

    const handleChatSupportClick = () => {
        navigate('/account/chat-support');
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleShopRatingChange = (shopId, newValue) => {
        setShopRatings(prev => ({
            ...prev,
            [shopId]: newValue
        }));
    };

    const handlePackagingFeedbackChange = (shopId, value) => {
        setPackagingFeedbacks(prev => ({
            ...prev,
            [shopId]: value
        }));
    };

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);

                if (!orderId) {
                    console.error("Order ID is missing");
                    return;
                }

                const token = localStorage.getItem("portal_token");
                if (!token) {
                    throw new Error("Authentication required");
                }

                const response = await fetch(
                    `${apiUrl}/portal/order/delivered_order_for_feedback?order_id=${orderId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to fetch order details');
                }

                const data = await response.json();
                setOrderData(data);

                // Initialize ratings for each shop
                if (data.shops && data.shops.length > 0) {
                    const initialRatings = {};
                    const initialPackaging = {};
                    data.shops.forEach(shop => {
                        initialRatings[shop.id] = 0;
                        initialPackaging[shop.id] = '';
                    });
                    setShopRatings(initialRatings);
                    setPackagingFeedbacks(initialPackaging);
                }
            } catch (err) {
                console.error("Feedback fetch error:", err);
                showSnackbar('Failed to load order details', { severity: 'error' }, 2000);
            } finally {
                setLoading(false);
            }
        };

        if (open && orderId) {
            console.log("Fetching order details with orderId:", orderId);
            fetchOrderDetails();
        }
    }, [open, orderId, apiUrl]);

    const handleSubmitFeedback = async () => {
        // Validate all shop ratings
        const unratedShops = orderData.shops.filter(shop => !shopRatings[shop.id] || shopRatings[shop.id] < 1);
        if (unratedShops.length > 0) {
            showSnackbar(`Please rate ${unratedShops.map(shop => shop.name).join(', ')}`, { severity: 'error' }, 2000);
            return;
        }

        setSubmitting(true);
        try {
            // Submit feedback for each shop
            const feedbackPromises = orderData.shops.map(shop => {
                return fetch(`${apiUrl}/portal/order/storeFeedback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('portal_token')}`,
                    },
                    body: JSON.stringify({
                        order_id: orderId,
                        shop_id: shop.id,
                        shop_rating: shopRatings[shop.id],
                        delivery_rating: deliveryRating || null,
                        packaging_quality: packagingFeedbacks[shop.id] || null,
                        comments: comments || null,
                        delivery_person_id: orderData.orderDetails?.delivery_person_id || null
                    })
                });
            });

            const responses = await Promise.all(feedbackPromises);
            const results = await Promise.all(responses.map(res => res.json()));

            // Check for any failed responses
            const failedResponses = results.filter(result => !result.status);
            if (failedResponses.length > 0) {
                throw new Error(failedResponses[0].message || 'Failed to submit some feedback');
            }

             showSnackbar(`Feedback submitted successfully!`, { severity: 'success' });
            setTimeout(() => {
                onClose();
                window.location.href = "/";
            }, 1500);
        } catch (error) {
            console.error('Error submitting feedback:', error);
             showSnackbar(error.message || 'Failed to submit feedback', { severity: 'error' }, 2000);
        } finally {
            setSubmitting(false);
        }
    };

    const deliveryTime = orderData?.orderDetails?.updated_at
        ? new Date(orderData.orderDetails.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const cartItems = orderData?.orderDetails?.user_cart?.cart_items
        ? JSON.parse(orderData.orderDetails.user_cart.cart_items)
        : [];

    const cardSx = {
        mb: 2,
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        borderRadius: 4
    };

    const renderOrderItem = (item, index) => {
        const isService = item.product === null && item.service !== null;
        const itemName = isService ? item.service.name : item.product?.name || 'Item';
        const itemDetails = isService ?
            `Service: ${item.service.options.print_side || 'Print Service'}` :
            item.product?.weight || '';

        return (
            <Tooltip
                key={index}
                title={`${item.quantity} x ${itemName}${itemDetails ? ` (${itemDetails})` : ''}`}
            >
                <Typography
                    variant="body2"
                    component="div"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                    }}
                >
                    {item.quantity} x {itemName}
                    {isService && (
                        <Typography variant="caption" color="textSecondary" component="span">
                            {' '}(Service)
                        </Typography>
                    )}
                </Typography>
            </Tooltip>
        );
    };

    const getItemsForShop = (shopId) => {
        return cartItems.filter(item => item.shop_id === shopId);
    };

    if (loading) {
        return (
            <Dialog
                fullScreen={isMobile}
                open={open}
                onClose={onClose}
                TransitionComponent={Transition}
                keepMounted
                sx={!isMobile ? {
                    "& .MuiDialog-paper": {
                        position: "fixed",
                        right: 0,
                        margin: 0,
                        width: "30%",
                        height: "100vh",
                        maxHeight: "100vh"
                    }
                } : {}}
            >
                <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <AppBar sx={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                        color: "transparent",
                        borderBottomLeftRadius: "10px",
                        borderBottomRightRadius: "10px",
                        zIndex: 10
                    }}>
                        <Toolbar>
                            <IconButton edge="start" onClick={onClose} aria-label="back">
                                <ArrowBack />
                            </IconButton>
                            <Typography sx={{ ml: 2, flex: 1, color: "black", fontWeight: "bold" }} variant="h6">
                                Order Feedback
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <Box p={2}>
                        <Skeleton variant="rectangular" width="100%" height={100} sx={{ mb: 2, borderRadius: 4 }} />
                        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2, borderRadius: 4 }} />
                        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2, borderRadius: 4 }} />
                        <Skeleton variant="rectangular" width="100%" height={150} sx={{ mb: 2, borderRadius: 4 }} />
                        <Skeleton variant="rectangular" width="100%" height={100} sx={{ mb: 2, borderRadius: 4 }} />
                    </Box>
                </Box>
            </Dialog>
        );
    }

    if (!orderData) {
        return (
            <Dialog
                fullScreen={isMobile}
                open={open}
                onClose={onClose}
                TransitionComponent={Transition}
                keepMounted
                sx={!isMobile ? {
                    "& .MuiDialog-paper": {
                        position: "fixed",
                        right: 0,
                        margin: 0,
                        width: "30%",
                        height: "100vh",
                        maxHeight: "100vh"
                    }
                } : {}}
            >
                <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <AppBar sx={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                        color: "transparent",
                        borderBottomLeftRadius: "10px",
                        borderBottomRightRadius: "10px",
                        zIndex: 10
                    }}>
                        <Toolbar>
                            <IconButton edge="start" onClick={onClose} aria-label="back">
                                <ArrowBack />
                            </IconButton>
                            <Typography sx={{ ml: 2, flex: 1, color: "black", fontWeight: "bold" }} variant="h6">
                                Order Feedback
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <Box p={2}>
                        <Typography color="error">Failed to load order details. Please try again.</Typography>
                    </Box>
                </Box>
            </Dialog>
        );
    }

    return (
        <>
            <Dialog
                fullScreen={isMobile}
                open={open}
                onClose={onClose}
                TransitionComponent={Transition}
                keepMounted
                sx={!isMobile ? {
                    "& .MuiDialog-paper": {
                        position: "fixed",
                        right: 0,
                        margin: 0,
                        width: "30%",
                        height: "100vh",
                        maxHeight: "100vh"
                    }
                } : {}}
            >
                <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <AppBar sx={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                        color: "transparent",
                        borderBottomLeftRadius: "10px",
                        borderBottomRightRadius: "10px",
                        zIndex: 10
                    }}>
                        <Toolbar>
                            <IconButton edge="start" onClick={onClose} aria-label="back">
                                <ArrowBack />
                            </IconButton>
                            <Typography sx={{ ml: 2, flex: 1, color: "black", fontWeight: "bold" }} variant="h6">
                                Order Feedback
                            </Typography>
                        </Toolbar>
                    </AppBar>

                    <Box p={2} maxWidth="100%" mx="auto">
                        {/* Delivery Status */}
                        <Card variant="outlined" sx={cardSx}>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Avatar
                                        sx={{ borderRadius: 2 }}
                                        alt="Delivered"
                                        src="/image/delivery_complete.gif"
                                        loading="eager"
                                        decoding="async"
                                    />
                                    <Box>
                                        {orderData.orderDetails?.address && (
                                            <Typography fontWeight="bold">
                                                Delivered at {orderData.orderDetails.address.address_type.toUpperCase()}
                                            </Typography>
                                        )}
                                        <Typography variant="body2" color="text.secondary">
                                            Your order was delivered at {deliveryTime}.
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Shop Tabs */}
                        {orderData.shops && orderData.shops.length > 1 && (
                            <Card variant="outlined" sx={cardSx}>
                                <CardContent>
                                    <Tabs
                                        value={activeTab}
                                        onChange={handleTabChange}
                                        variant="scrollable"
                                        scrollButtons="auto"
                                        aria-label="shop tabs"
                                    >
                                        {orderData.shops.map((shop, index) => (
                                            <Tab
                                                key={shop.id}
                                                label={shop.name}
                                                icon={<Store fontSize="small" />}
                                                iconPosition="start"
                                            />
                                        ))}
                                    </Tabs>
                                </CardContent>
                            </Card>
                        )}

                        {/* Current Shop Feedback */}
                        {orderData.shops && orderData.shops.length > 0 && (
                            <Card variant="outlined" sx={cardSx}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Box>
                                            <Typography variant="h6" component="div" fontWeight="bold">
                                                {orderData.shops[activeTab]?.name || 'Shop'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" component="div">
                                                {orderData.shops[activeTab]?.location || 'Address not available'}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            color="success"
                                            component="a"
                                            href={`tel:${orderData.shops[activeTab]?.number}`}
                                            sx={{
                                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                borderRadius: '50%',
                                                width: 40,
                                                height: 40,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.2)',
                                                },
                                            }}
                                        >
                                            <Phone />
                                        </IconButton>
                                    </Box>

                                    <Typography variant="body2" gutterBottom>
                                        <strong>ORDER ID : {orderData.orderDetails?.order_id || 'N/A'}</strong>
                                    </Typography>

                                    <Box sx={{ my: 2 }}>
                                        <Typography variant="subtitle2">Items from this shop:</Typography>
                                        {getItemsForShop(orderData.shops[activeTab]?.id).map((item, index) => (
                                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <Chip
                                                    label={`${item.quantity}x`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                                <Typography variant="body2">
                                                    {item.product?.name || item.service?.name}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography>Rate {orderData.shops[activeTab]?.name || 'the shop'}</Typography>
                                    <Rating
                                        value={shopRatings[orderData.shops[activeTab]?.id] || 0}
                                        onChange={(event, newValue) =>
                                            handleShopRatingChange(orderData.shops[activeTab]?.id, newValue)
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                    />

                                    <Typography mt={2}>How was the shop's packaging?</Typography>
                                    <Box display="flex" gap={2} mt={1}>
                                        <Button
                                            variant={packagingFeedbacks[orderData.shops[activeTab]?.id] === 'bad' ? 'contained' : 'outlined'}
                                            color="error"
                                            onClick={() => handlePackagingFeedbackChange(orderData.shops[activeTab]?.id, 'bad')}
                                        >
                                            Not Good
                                        </Button>
                                        <Button
                                            variant={packagingFeedbacks[orderData.shops[activeTab]?.id] === 'good' ? 'contained' : 'outlined'}
                                            color="success"
                                            onClick={() => handlePackagingFeedbackChange(orderData.shops[activeTab]?.id, 'good')}
                                        >
                                            Good
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* Delivery Partner Info (shown once for all shops) */}
                        {orderData.orderDetails?.delivery_person && (
                            <Card variant="outlined" sx={cardSx}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                                        <Avatar
                                            sx={{ borderRadius: 2 }}
                                            alt="Delivered"
                                            src="/image/delivery_boy.gif"
                                            loading="eager"
                                            decoding="async"
                                        />
                                        <Box>
                                            <Typography fontWeight="bold">{orderData.orderDetails.delivery_person.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {orderData.orderDetails.delivery_person.rating || '4.6'} ★ | {orderData.orderDetails.delivery_person.total_deliveries || '0'} orders delivered
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography>Rate the delivery partner</Typography>
                                    <Rating
                                        value={deliveryRating}
                                        onChange={(event, newValue) => setDeliveryRating(newValue)}
                                        onClick={(e) => e.stopPropagation()}
                                    />

                                    <Box display="flex" alignItems="center" mt={2} gap={1}>
                                        <Report fontSize="small" color="error" />
                                        <Typography variant="body2" color="error">Report a fraud</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* Delivery Address */}
                        {orderData.orderDetails?.address && (
                            <Card variant="outlined" sx={cardSx}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Phone fontSize="small" color='primary' />
                                        <Typography variant="body2">
                                            {orderData.orderDetails.address.full_name}, {orderData.orderDetails.address.phone_number}
                                        </Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                                        <Home fontSize="small" color='primary' />
                                        <Typography variant="body2">
                                            {orderData.orderDetails.address.location}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* Comments and Submit Section */}
                        <Card variant="outlined" sx={cardSx}>
                            <CardContent>
                                <TextField
                                    fullWidth
                                    label="Additional Comments (Optional)"
                                    variant="outlined"
                                    multiline
                                    rows={3}
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    sx={{ mb: 2 }}
                                    onClick={(e) => e.stopPropagation()}
                                    onFocus={(e) => e.stopPropagation()}
                                />
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSubmitFeedback}
                                    disabled={submitting || Object.values(shopRatings).some(rating => rating < 1)}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Help and Support */}
                        <Card onClick={handleChatSupportClick} variant="outlined" sx={cardSx}>
                            <CardContent>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <HelpOutline />
                                        <Typography>Need help with your order?</Typography>
                                    </Box>
                                    <Button variant="outlined" onClick={handleChatSupportClick} size="small">Get help & support</Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Dialog>

            {/* Snackbar should be outside the Dialog */}
            <CustomSnackbar
                open={snackbar.open}
                handleClose={handleSnackbarClose}
                severity={snackbar.severity}
                message={snackbar.message}
            />
        </>
    );
};

export default UserFeedback;
