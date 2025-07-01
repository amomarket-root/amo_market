import React from 'react';
import { Card, CardContent, Grid, Typography, Avatar, Divider, Box, CircularProgress, Skeleton } from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

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

const OrderSummaryCard = ({ loading, orderDetails, cartItems }) => {
    return (
        <Card sx={{ mb: 1, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)", borderRadius: 4 }}>
            <CardContent>
                {loading ? (
                    <Box>
                        <Grid container alignItems="center" spacing={1}>
                            <Grid item>
                                <Skeleton variant="circular" width={40} sx={{ borderRadius: 4 }} height={40} />
                            </Grid>
                            <Grid item xs>
                                <Skeleton variant="text" width="60%" sx={{ borderRadius: 4 }} height={24} />
                                <Skeleton variant="text" width="40%" sx={{ borderRadius: 4 }} height={20} />
                            </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
                            <CircularProgress />
                        </Box>
                    </Box>
                ) : (
                    <Box>
                        <Grid container alignItems="center" spacing={1}>
                            <Grid item>
                                <Avatar sx={{ bgcolor: "#fff0f0" }}>
                                    <ShoppingBagOutlinedIcon color="error" />
                                </Avatar>
                            </Grid>
                            <Grid item xs>
                                <Typography variant="h6" fontWeight="bold">
                                    Order summary
                                </Typography>
                                <Typography color="textSecondary" fontSize="small">
                                    Order id - #{orderDetails?.order_id}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />
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
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default OrderSummaryCard;
