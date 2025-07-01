import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Grid, Typography, Paper, Skeleton, Box, Chip, Divider } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import InvoiceGenerator from "./InvoiceGenerator";
import StoreIcon from '@mui/icons-material/Store';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';

const OrderSummaryPage = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const portal_token = localStorage.getItem('portal_token');
        if (!portal_token) {
            console.log('User is not authenticated');
            return;
        }
        const fetchOrderDetails = async () => {
            try {
                const response = await fetch(`${apiUrl}/portal/order/order_details?order_id=${orderId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${portal_token}`,
                            'Content-Type': 'application/json'
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch order details");
                }

                const data = await response.json();
                setOrderDetails(data);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [apiUrl, orderId]);

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

    if (!orderDetails && !loading) {
        return <Paper elevation={3} sx={{ p: 4, mb: 2, mt: 3, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                No Order found!
            </Typography>
        </Paper>;
    }

    // Parse cart_items from the API response
    const cartItems = orderDetails ? JSON.parse(orderDetails.orderDetails.user_cart.cart_items) : [];

    // Map cart_items to orderItems (both products and services)
    const orderItems = cartItems.map((item) => {
        if (item.product) {
            return {
                name: item.product.name,
                quantity: item.quantity,
                weight: item.product.weight,
                price: parseFloat(item.price),
                image: item.product.image,
                type: 'product',
                shopId: item.shop_id
            };
        } else if (item.service) {
            const shopType = item.service.options?.shop_type || 'default';
            return {
                name: item.service.name,
                quantity: item.quantity,
                weight: item.service.options.print_side || 'service',
                price: parseFloat(item.price),
                image: getServiceImage(shopType),
                type: 'service',
                shopId: item.shop_id
            };
        }
        return null;
    }).filter(Boolean);

    // Calculate item total by summing (price × quantity) for all items
    const calculatedItemTotal = orderItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    // Group items by shop
    const itemsByShop = {};
    orderItems.forEach(item => {
        if (!itemsByShop[item.shopId]) {
            itemsByShop[item.shopId] = [];
        }
        itemsByShop[item.shopId].push(item);
    });

    // Bill details
    const billDetails = orderDetails ? {
        itemTotal: calculatedItemTotal,
        handlingCharge: parseFloat(orderDetails.orderDetails.user_cart.platform_charge),
        deliveryCharges: parseFloat(orderDetails.orderDetails.user_cart.delivery_charge) ?? "free",
        billTotal: parseFloat(orderDetails.orderDetails.user_cart.grand_total),
    } : {};

    // Order details
    const orderInfo = orderDetails ? {
        orderId: orderDetails.orderDetails.order_id,
        payment: orderDetails.orderDetails.payment_method,
        address: orderDetails.orderDetails.address.full_address,
        orderPlaced: new Date(orderDetails.orderDetails.created_at).toLocaleString(),
    } : {};

    const handleChatSupportClick = () => {
        navigate('/account/chat-support');
    };

    const getShopDetails = (shopId) => {
        if (!orderDetails?.shops) return null;
        return orderDetails.shops.find(shop => shop.id === shopId);
    };

    return (
        <Container sx={{ maxWidth: '100%', padding: '0px'}} maxWidth={false}>
            <Typography variant="h5" fontWeight="bold">
                Order Summary
            </Typography>
            <Typography variant="body2" color="textSecondary">
                Arrived At : {orderDetails ? new Date(orderInfo.orderPlaced).toLocaleTimeString() : ''}
            </Typography>

            {/* Use InvoiceGenerator Component */}
            <InvoiceGenerator orderInfo={orderInfo} billDetails={billDetails} orderItems={orderItems} />

            {/* Display items grouped by shop */}
            {Object.entries(itemsByShop).map(([shopId, items]) => {
                const shop = getShopDetails(shopId);
                return (
                    <Paper key={shopId} elevation={3} sx={{ mt: 3, p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            {shop?.shop_type_id === '63dc5c46-8ae2-4c2e-b808-55192e41b9d9' ? (
                                <LocalPrintshopIcon color="primary" sx={{ mr: 1 }} />
                            ) : (
                                <StoreIcon color="primary" sx={{ mr: 1 }} />
                            )}
                            <Typography variant="h6" fontWeight="bold">
                                {loading ? <Skeleton width="40%" /> : shop?.name || 'Shop'}
                            </Typography>
                            {shop && (
                                <Chip
                                    label={shop.time}
                                    size="small"
                                    sx={{ ml: 1, bgcolor: '#f5f5f5' }}
                                />
                            )}
                        </Box>

                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            {loading
                                ? Array.from({ length: 3 }).map((_, index) => (
                                    <Grid container item xs={12} key={index} alignItems="center">
                                        <Grid item xs={2}>
                                            <Skeleton variant="rectangular" width={50} height={50} />
                                        </Grid>
                                        <Grid item xs={7}>
                                            <Skeleton variant="text" width="80%" />
                                            <Skeleton variant="text" width="60%" />
                                        </Grid>
                                        <Grid item xs={3} textAlign="right">
                                            <Skeleton variant="text" width="50%" />
                                        </Grid>
                                    </Grid>
                                ))
                                : items.map((item, index) => {
                                    const totalPrice = (item.price * item.quantity).toFixed(2);
                                    return (
                                        <Grid container item xs={12} key={index} alignItems="center">
                                            <Grid item xs={2}>
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    style={{
                                                        width: "100%",
                                                        height: 50,
                                                        objectFit: 'contain',
                                                        borderRadius: 8
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={7}>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {item.quantity} x {item.weight}
                                                </Typography>
                                                {item.type === 'service' && (
                                                    <Typography variant="caption" color="textSecondary">
                                                        Service
                                                    </Typography>
                                                )}
                                            </Grid>
                                            <Grid item xs={3} textAlign="right">
                                                <Typography variant="body1" fontWeight="bold">
                                                    ₹{totalPrice}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    (₹{item.price} × {item.quantity})
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    );
                                })}
                        </Grid>
                    </Paper>
                );
            })}

            {/* Skeleton Loader for Bill Details */}
            <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                    {loading ? <Skeleton width="30%" /> : "Bill details"}
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {loading
                        ? Array.from({ length: 5 }).map((_, index) => (
                            <Grid container item xs={12} key={index}>
                                <Grid item xs={9}>
                                    <Skeleton variant="text" width="60%" />
                                </Grid>
                                <Grid item xs={3} textAlign="right">
                                    <Skeleton variant="text" width="40%" />
                                </Grid>
                            </Grid>
                        ))
                        : Object.entries(billDetails).map(([key, value], index) => (
                            <Grid container item xs={12} key={index}>
                                <Grid item xs={9}>
                                    <Typography variant="body1" color="textSecondary">
                                        {key.replace(/([A-Z])/g, " $1").trim()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={3} textAlign="right">
                                    <Typography variant="body1" fontWeight="bold">
                                        {typeof value === "number" ? `₹${value.toFixed(2)}` : value}
                                    </Typography>
                                </Grid>
                            </Grid>
                        ))}
                </Grid>
            </Paper>

            {/* Delivery Information */}
            {orderDetails?.orderDetails?.delivery_person && (
                <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Delivery Person Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <strong>Delivery Person:</strong> {orderDetails.orderDetails.delivery_person.name}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <strong>Contact:</strong> {orderDetails.orderDetails.delivery_person.number}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                <strong>Vehicle:</strong> {orderDetails.orderDetails.delivery_person.delivery_mode} ({orderDetails.orderDetails.delivery_person.vehicle_number})
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Skeleton Loader for Order Details */}
            <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                    {loading ? <Skeleton width="30%" /> : "Order details"}
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {loading
                        ? Array.from({ length: 4 }).map((_, index) => (
                            <Grid item xs={12} key={index}>
                                <Skeleton variant="text" width="80%" />
                            </Grid>
                        ))
                        : (
                            <>
                                <Grid item xs={12}>
                                    <Typography variant="body1">
                                        Order ID: {orderInfo.orderId}{" "}
                                        <ContentCopyIcon fontSize="small" sx={{ cursor: "pointer" }} />
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body1">
                                        Payment: {orderInfo.payment}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body1">
                                        Deliver to: {orderInfo.address}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body1">
                                        Order placed on: {orderInfo.orderPlaced}
                                    </Typography>
                                </Grid>
                            </>
                        )}
                </Grid>
            </Paper>

            {/* Skeleton Loader for Help Section */}
            <Paper
                elevation={3}
                sx={{ mt: 3, p: 2, cursor: "pointer" }}
                onClick={handleChatSupportClick}
            >
                <Typography variant="h6" fontWeight="bold">
                    {loading ? <Skeleton width="50%" /> : "Need help with your order?"}
                </Typography>
                <Grid container alignItems="center" spacing={2} sx={{ mt: 1 }}>
                    <Grid item>
                        {loading ? (
                            <Skeleton variant="circular" width={40} height={40} />
                        ) : (
                            <ChatBubbleOutlineIcon fontSize="large" sx={{ color: "#555" }} />
                        )}
                    </Grid>
                    <Grid item xs>
                        {loading ? (
                            <>
                                <Skeleton variant="text" width="60%" />
                                <Skeleton variant="text" width="40%" />
                            </>
                        ) : (
                            <>
                                <Typography variant="body1" fontWeight="bold">
                                    Chat with us
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    About any issues related to your order
                                </Typography>
                            </>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default OrderSummaryPage;
