import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import useMediaQuery from "@mui/material/useMediaQuery";
import Slide from "@mui/material/Slide";
import { useTheme } from "@mui/material/styles";
import { Box, Card, Typography, IconButton, AppBar, Toolbar, Skeleton, CardContent, Grid, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import OrderStatusCard from "./OrderStatusCard";
import DeliveryPartnerCard from "./DeliveryPartnerCard";
import DeliveryDetailsCard from "./DeliveryDetailsCard";
import PersonIcon from "@mui/icons-material/Person";
import RoomIcon from "@mui/icons-material/Room";
import ShieldIcon from "@mui/icons-material/Shield";
import HelpCard from "./HelpCard";
import OrderSummaryCard from "./OrderSummaryCard";
import UserFeedback from "../Feedback/UserFeedback";
import { useOrderContext } from './OrderContext';
import useGoogleMaps from '../Location/GoogleMapsLoader';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
});

const OrderModel = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const apiUrl = import.meta.env.VITE_API_URL;
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { isOrderModelOpen, closeOrderModel, selectedOrderId } = useOrderContext();
    const mapRef = useRef(null);
    const { isLoaded: googleMapsLoaded, loadError } = useGoogleMaps(googleApiKey);
    const [orderDetails, setOrderDetails] = useState(null);
    const [shopDetails, setShopDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const previousStatus = useRef(null);
    const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [feedbackOrderId, setFeedbackOrderId] = useState(null);
    const [hasActiveOrder, setHasActiveOrder] = useState(false);
    const [mapInstance, setMapInstance] = useState(null);
    const [deliveryBoyMarker, setDeliveryBoyMarker] = useState(null);
    const [shopMarkers, setShopMarkers] = useState([]);
    const [polylines, setPolylines] = useState([]);
    const [shopStatuses, setShopStatuses] = useState({});

    const userLocation = useMemo(() => {
        return orderDetails?.address
            ? { lat: parseFloat(orderDetails.address.latitude), lng: parseFloat(orderDetails.address.longitude) }
            : null;
    }, [orderDetails]);

    const initializeMap = useCallback(() => {
        if (!googleMapsLoaded || !window.google || !window.google.maps || !mapRef.current || !userLocation || !shopDetails.length) {
            return;
        }

        const map = new window.google.maps.Map(mapRef.current, {
            zoom: 14,
        });
        setMapInstance(map);

        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(userLocation);

        const newShopMarkers = [];
        const newPolylines = [];

        shopDetails.forEach((shop) => {
            const shopLocation = { lat: parseFloat(shop.latitude), lng: parseFloat(shop.longitude) };
            bounds.extend(shopLocation);

            const marker = new window.google.maps.Marker({
                position: shopLocation,
                map: map,
                title: shop.name,
                icon: {
                    url: `/image/shop_location.gif`,
                    scaledSize: new window.google.maps.Size(50, 50),
                    anchor: new window.google.maps.Point(25, 35)
                },
            });
            newShopMarkers.push(marker);

            const polyline = new window.google.maps.Polyline({
                path: [shopLocation, userLocation],
                geodesic: true,
                strokeColor: "#0a0909",
                strokeOpacity: 1,
                strokeWeight: 3,
                map: map,
            });
            newPolylines.push(polyline);
        });

        setShopMarkers(newShopMarkers);
        setPolylines(newPolylines);

        new window.google.maps.Marker({
            position: userLocation,
            map: map,
            title: "Your Location",
            icon: {
                url: `/image/user_location.gif`,
                scaledSize: new window.google.maps.Size(50, 50),
                anchor: new window.google.maps.Point(25, 35)
            },
        });

        const marker = new window.google.maps.Marker({
            position: deliveryBoyLocation || null,
            map: map,
            title: "Delivery Boy",
            icon: {
                url: `/image/delivery_boy_location.gif`,
                scaledSize: new window.google.maps.Size(40, 40),
            },
        });
        setDeliveryBoyMarker(marker);

        map.fitBounds(bounds);
    }, [googleMapsLoaded, userLocation, shopDetails, deliveryBoyLocation]);

    useEffect(() => {
        if (isOrderModelOpen) {
            initializeMap();
        }

        return () => {
            if (mapInstance) {
                shopMarkers.forEach(marker => marker.setMap(null));
                polylines.forEach(polyline => polyline.setMap(null));
                if (deliveryBoyMarker) {
                    deliveryBoyMarker.setMap(null);
                }
            }
        };
    }, [isOrderModelOpen, initializeMap]);

    useEffect(() => {
        if (orderDetails?.id && googleMapsLoaded) {
            const channel = window.Echo.channel(`delivery.location.${orderDetails.id}`);
            channel.listen('.delivery.live.location', (data) => {
                const newPosition = {
                    lat: parseFloat(data.latitude),
                    lng: parseFloat(data.longitude),
                };

                console.log("Updated delivery position in cart model:", newPosition);
                setDeliveryBoyLocation(newPosition);

                if (deliveryBoyMarker) {
                    deliveryBoyMarker.setPosition(newPosition);
                }

                if (mapInstance) {
                    mapInstance.panTo(newPosition);
                }
            });

            return () => {
                channel.stopListening('.delivery.live.location');
            };
        }
    }, [orderDetails, googleMapsLoaded, deliveryBoyMarker, mapInstance]);

    const fetchOrderDetails = useCallback(async () => {
        if (!selectedOrderId) {
            console.log("Order ID not found");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/portal/user/get_order_details/${selectedOrderId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('portal_token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }

            const data = await response.json();
            const orderData = data.orderDetails;

            // Transform the data to match the expected format
            const transformedOrderDetails = {
                ...orderData,
                status: orderData.order_status,
                user_cart: {
                    ...orderData.user_cart,
                    cart_items: orderData.user_cart.cart_items
                }
            };

            setOrderDetails(transformedOrderDetails);
            setShopDetails(orderData.shops);

            // Create shop statuses object
            const statuses = {};
            orderData.shops.forEach(shop => {
                statuses[shop.id] = shop.pivot.status;
            });
            setShopStatuses(statuses);

            const currentStatus = orderData.order_status;
            setHasActiveOrder(currentStatus !== 'delivered');

            if (previousStatus.current && previousStatus.current !== currentStatus) {
                window.dispatchEvent(new Event('orderChange'));
            }

            previousStatus.current = currentStatus;

            if (currentStatus === 'delivered') {
                setFeedbackOrderId(selectedOrderId);
                closeOrderModel();
                setFeedbackOpen(true);
            }
        } catch (err) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, closeOrderModel, selectedOrderId]);

    useEffect(() => {
        if (isOrderModelOpen && selectedOrderId) {
            fetchOrderDetails();
            let intervalId;

            if (hasActiveOrder) {
                intervalId = setInterval(fetchOrderDetails, 60000);
            }

            return () => {
                if (intervalId) clearInterval(intervalId);
            };
        }
    }, [isOrderModelOpen, selectedOrderId, fetchOrderDetails, hasActiveOrder]);

    const handleFeedbackClose = () => {
        setFeedbackOpen(false);
        navigate('/');
    };

    const getShopStatusMessage = (shopId) => {
        const status = shopStatuses[shopId];
        const shop = shopDetails.find(s => s.id === shopId);

        if (!status || !shop) return null;

        switch (status) {
            case 'pending':
                return `${shop.name} is reviewing your order`;
            case 'accepted':
                return `${shop.name} accepted your order`;
            case 'preparing':
                return `${shop.name} is preparing it`;
            case 'shipped':
                return `On the way from ${shop.name}`;
            case 'declined':
                return `${shop.name} declined your order`;
            default:
                return `${shop.name} status: ${status}`;
        }
    };

    const cartItems = orderDetails?.user_cart?.cart_items ? JSON.parse(orderDetails.user_cart.cart_items) : [];
    const cartUserAddress = orderDetails?.address;
    const deliveryPartner = orderDetails?.delivery_person;

    if (loadError) {
        return (
            <Dialog open={isOrderModelOpen} onClose={closeOrderModel}>
                <Box p={3}>
                    <Typography color="error">Error loading Google Maps: {loadError.message}</Typography>
                    <Button onClick={closeOrderModel}>Close</Button>
                </Box>
            </Dialog>
        );
    }

    return (
        <>
            <Dialog
                fullScreen={isMobile}
                open={isOrderModelOpen}
                onClose={closeOrderModel}
                TransitionComponent={Transition}
                keepMounted
                sx={!isMobile ? { "& .MuiDialog-paper": { position: "fixed", right: 0, margin: 0, width: "30%", height: "100vh", maxHeight: "100vh" } } : {}}
            >
                <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <AppBar sx={{ position: "sticky", top: 0, backgroundColor: "#fff", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", color: "transparent", borderBottomLeftRadius: "10px", borderBottomRightRadius: "10px", zIndex: 10 }}>
                        <Toolbar>
                            <IconButton edge="start" onClick={closeOrderModel} aria-label="back">
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography sx={{ ml: 2, flex: 1, color: "black", fontWeight: "bold" }} variant="h6">
                                Order Summary
                            </Typography>
                        </Toolbar>
                    </AppBar>

                    <Box sx={{ mt: 1, padding: "5px" }}>
                        {loading ? (
                            <Card sx={{ mb: 2, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)", borderRadius: 4, overflow: "hidden" }}>
                                <CardContent>
                                    <Skeleton variant="text" width="95%" height={40} sx={{ mt: 1 }} />
                                    <Skeleton variant="text" width="95%" height={40} />
                                    <Skeleton variant="text" width="70%" height={40} />
                                    <Skeleton variant="rectangular" width="100%" sx={{ borderRadius: 4 }} height={300} />
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                {/* Main order status card */}
                                <OrderStatusCard
                                    status={orderDetails?.status}
                                    imageSrc={
                                        orderDetails?.status === 'pending' ? "/image/order_pending.gif" :
                                        orderDetails?.status === 'accepted' ? "/image/order_accept.gif" :
                                        orderDetails?.status === 'preparing' ? "/image/order_preparing.gif" :
                                        orderDetails?.status === 'on_the_way' ? "/image/order_on_the_way.gif" :
                                        orderDetails?.status === 'reached' ? "/image/order_reached.gif" :
                                        "/image/order_default.gif"
                                    }
                                    title={
                                        orderDetails?.status === 'pending' ? "Arriving in 20 minutes" :
                                        orderDetails?.status === 'accepted' ? "Arriving in 15 minutes" :
                                        orderDetails?.status === 'preparing' ? "Arriving in 12 minutes" :
                                        orderDetails?.status === 'on_the_way' ? "Arriving in 10 minutes" :
                                        orderDetails?.status === 'reached' ? "Arriving in your location" :
                                        "Order in progress"
                                    }
                                    description={
                                        orderDetails?.status === 'pending' ? "Your order is Pending, the shops will accept it soon." :
                                        orderDetails?.status === 'accepted' ? "Shops have accepted your order, assigning delivery partners soon." :
                                        orderDetails?.status === 'preparing' ? "Shops are preparing your order. Delivery partners will be on the way soon." :
                                        orderDetails?.status === 'on_the_way' ? "Your order is On The Way. Your delivery partners will arrive shortly." :
                                        orderDetails?.status === 'reached' ? "Your order has Reached your location. The delivery partners will deliver it soon." :
                                        "Your order is being processed"
                                    }
                                    mapRef={googleMapsLoaded ? mapRef : null}
                                />

                                {/* Shop-specific status cards */}
                                {shopDetails.map((shop) => (
                                    <Card key={shop.id} sx={{ mb: 1, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)", borderRadius: 4 }}>
                                        <CardContent>
                                            <Grid container spacing={1} alignItems="center">
                                                <Grid item>
                                                    <img
                                                        src={shop.image}
                                                        alt={shop.name}
                                                        style={{
                                                            width: 50,
                                                            height: 50,
                                                            borderRadius: '50%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {shop.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {getShopStatusMessage(shop.id)}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        Distance: {shop.time}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))}
                            </>
                        )}

                        <Card sx={{ mb: 2, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)", borderRadius: 4 }}>
                            <CardContent>
                                <Grid container spacing={1} alignItems="center">
                                    <Grid item>
                                        <PersonIcon color="primary" sx={{ fontSize: 30 }} />
                                    </Grid>
                                    <Grid item xs>
                                        <Typography variant="h6" fontWeight="bold">
                                            Share your info
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Your answers will help us enhance your shopping experience.
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Button variant="contained" color="success">
                                            Let's Go!
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {loading ? (
                            <Card sx={{ mb: 2, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)", borderRadius: 4 }}>
                                <CardContent>
                                    <Skeleton variant="rectangular" width="100%" sx={{ borderRadius: 4 }} height={100} />
                                </CardContent>
                            </Card>
                        ) : orderDetails?.status === "preparing" || orderDetails?.status === "on_the_way" || orderDetails?.status === "reached" ? (
                            <DeliveryPartnerCard deliveryPartner={deliveryPartner} />
                        ) : (
                            <Card sx={{ mb: 2, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)", borderRadius: 4 }}>
                                <CardContent>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid item>
                                            <RoomIcon color="warning" sx={{ fontSize: 30 }} />
                                        </Grid>
                                        <Grid item xs>
                                            <Typography variant="h6" fontWeight="bold">
                                                Delivery partners will be assigned after packing.
                                            </Typography>
                                            <Typography color="textSecondary">
                                                Your shops are nearby. Learn about delivery partner safety.
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <ShieldIcon color="success" sx={{ fontSize: 30 }} />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}

                        <DeliveryDetailsCard cartUserAddress={cartUserAddress} />

                        <HelpCard loading={loading} />

                        <OrderSummaryCard loading={loading} orderDetails={orderDetails} cartItems={cartItems} />
                    </Box>
                </Box>
            </Dialog>

            <UserFeedback
                open={feedbackOpen}
                onClose={() => {
                    setFeedbackOpen(false);
                    navigate('/');
                }}
                orderId={feedbackOrderId}
            />
        </>
    );
};

export default OrderModel;
