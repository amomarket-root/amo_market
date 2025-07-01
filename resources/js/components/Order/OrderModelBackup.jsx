import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import useMediaQuery from "@mui/material/useMediaQuery";
import Slide from "@mui/material/Slide";
import { useTheme } from "@mui/material/styles";
import { Box, Card, Typography, IconButton, AppBar, Toolbar, CardContent, Grid, Button, Divider, Avatar, CircularProgress, Skeleton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import RoomIcon from "@mui/icons-material/Room";
import ShieldIcon from "@mui/icons-material/Shield";
import DeliveryScooterIcon from "@mui/icons-material/ElectricScooter";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useNavigate } from "react-router-dom";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
});

const OrderModel = ({ open, onClose }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const apiUrl = import.meta.env.VITE_API_URL;
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const mapRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [shopDetails, setShopDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);

    const userLocation = useMemo(() => {
        return orderDetails?.address
            ? { lat: parseFloat(orderDetails.address.latitude), lng: parseFloat(orderDetails.address.longitude) }
            : null;
    }, [orderDetails]);

    useEffect(() => {
        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places&callback=initMap`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);

            script.onload = () => {
                setMapLoaded(true);
            };

            return () => {
                document.head.removeChild(script);
            };
        } else {
            setMapLoaded(true);
        }
    }, [googleApiKey]);

    useEffect(() => {
        if (open && mapLoaded && userLocation && shopDetails.length > 0 && mapRef.current) {
            const map = new window.google.maps.Map(mapRef.current, {
                zoom: 14,
            });

            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(userLocation);

            shopDetails.forEach((shop) => {
                const shopLocation = { lat: parseFloat(shop.latitude), lng: parseFloat(shop.longitude) };
                bounds.extend(shopLocation);

                new window.google.maps.Marker({
                    position: shopLocation,
                    map: map,
                    title: shop.name,
                    icon: {
                        url: `/image/shop_location.gif`,
                        scaledSize: new window.google.maps.Size(40, 40),
                    },
                });

                new window.google.maps.Polyline({
                    path: [shopLocation, userLocation],
                    geodesic: true,
                    strokeColor: "#0a0909",
                    strokeOpacity: 1,
                    strokeWeight: 3,
                    map: map,
                });
            });

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

            // Initialize delivery boy's marker with the correct initial position
            const deliveryBoyMarker = new window.google.maps.Marker({
                position: deliveryBoyLocation || null, // Use deliveryBoyLocation if available, else fallback to userLocation
                map: map,
                title: "Delivery Boy",
                icon: {
                    url: `/image/delivery_boy_location.gif`,
                    scaledSize: new window.google.maps.Size(40, 40),
                },
            });

            // Listen for location updates
            if (orderDetails?.id) {
                const channel = window.Echo.channel(`delivery.location.${orderDetails.id}`);
                channel.listen('.delivery.live.location', (data) => {
                    // Ensure latitude and longitude are valid numbers
                    const newPosition = {
                        lat: parseFloat(data.latitude),
                        lng: parseFloat(data.longitude),
                    };

                    console.log("Updated delivery position in cart model:", newPosition);
                    // Update state with new position
                    setDeliveryBoyLocation(newPosition);

                    // Update marker position (if marker exists)
                    if (deliveryBoyMarker) {
                        deliveryBoyMarker.setPosition(newPosition);
                    }

                    // Pan map to new position (if map exists)
                    if (map) {
                        map.panTo(newPosition);
                    }
                });
            }

            map.fitBounds(bounds);
        }
    }, [open, mapLoaded, userLocation, shopDetails, orderDetails, deliveryBoyLocation]);

    const fetchOrderDetails = useCallback(async () => {
        const orderId = localStorage.getItem("order_id");
        if (!orderId) {
            console.log("Order ID not found in local storage");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/portal/user/get_order_details/${orderId}`, {
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
            setOrderDetails(data.orderDetails);
            setShopDetails(data.shops);
            if (data.orderDetails.status === 'delivered') {
                onClose();
                navigate('/');
            }
        } catch (err) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, navigate, onClose]);

    // useEffect(() => {
    //     const userId = localStorage.getItem("user_id");
    //     if (!userId) return;

    //     const channel = window.Echo.channel(`notification_order_status_for_user.${userId}`);

    //     channel.listen(".order.status.notification", (data) => {
    //         fetchOrderDetails();
    //         console.log("Message received from WebSocket:", data);
    //     });

    //     return () => {
    //         //channel.stopListening(".order.status.notification");
    //         window.Echo.leaveChannel(`notification_order_status_for_user.${userId}`);
    //     };
    // }, [fetchOrderDetails]);

    useEffect(() => {
        if (open) {
            fetchOrderDetails();
            const interval = setInterval(fetchOrderDetails, 60000);
            return () => clearInterval(interval);
        }
    }, [open, fetchOrderDetails]);

    const cartItems = orderDetails?.user_cart?.cart_items ? JSON.parse(orderDetails.user_cart.cart_items) : [];
    const cartUserAddress = orderDetails?.address;
    const deliveryPartner = orderDetails?.delivery_person;

    const renderOrderStatusCard = (status, imageSrc, title, description) => (
        <Card sx={{ mb: 1, borderRadius: 2, overflow: "hidden" }}>
            <CardContent>
                <Box display="flex" alignItems="center">
                    <img src={imageSrc} alt={status} style={{ width: "40px", height: "40px", marginRight: "8px" }} />
                    <Typography variant="h5" color="green" fontWeight="bold" gutterBottom>
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h6" gutterBottom>
                    {description}
                </Typography>
            </CardContent>
            <div ref={mapRef} style={{ height: "300px", width: "100%", borderRadius: "8px", margin: "8px" }}></div>
        </Card>
    );

    return (
        <Dialog
            fullScreen={isMobile}
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            keepMounted
            sx={!isMobile ? { "& .MuiDialog-paper": { position: "fixed", right: 0, margin: 0, width: "30%", height: "100vh", maxHeight: "100vh" } } : {}}
        >
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <AppBar sx={{ position: "sticky", top: 0, backgroundColor: "#fff", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", color: "transparent", borderBottomLeftRadius: "10px", borderBottomRightRadius: "10px", zIndex: 10 }}>
                    <Toolbar>
                        <IconButton edge="start" onClick={onClose} aria-label="back">
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1, color: "black", fontWeight: "bold" }} variant="h6">
                            Order Summary
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Box sx={{ mt: 1, backgroundColor: "#fff", borderRadius: "12px", padding: "5px", boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)" }}>
                    {loading ? (
                        <Card sx={{ mb: 1, borderRadius: 2, overflow: "hidden" }}>
                            <CardContent>
                                <Skeleton variant="text" width="95%" height={40} sx={{ mt: 1 }} />
                                <Skeleton variant="text" width="95%" height={40}/>
                                <Skeleton variant="text" width="70%" height={40}/>
                                <Skeleton variant="rectangular" width="100%" sx={{ borderRadius: 4 }} height={300} />
                            </CardContent>
                        </Card>
                    ) : orderDetails?.status === 'pending' ? (
                        renderOrderStatusCard("pending", "/image/order_pending.gif", "Arriving in 20 minutes", "Your order is Pending, the shop will accept it soon.")
                    ) : orderDetails?.status === 'accepted' ? (
                        renderOrderStatusCard("accepted", "/image/order_accept.gif", "Arriving in 15 minutes", `${shopDetails[0]?.name} Accepted your order, assigning a delivery partner soon.`)
                    ) : orderDetails?.status === 'preparing' ? (
                        renderOrderStatusCard("preparing", "/image/order_preparing.gif", "Arriving in 12 minutes", `${shopDetails[0]?.name} is preparing your order. Delivery partner is on the way.`)
                    ) : orderDetails?.status === 'on_the_way' ? (
                        renderOrderStatusCard("on_the_way", "/image/order_on_the_way.gif", "Arriving in 10 minutes", "Your order is On The Way. Your delivery partner will arrive shortly.")
                    ) : orderDetails?.status === 'reached' ? (
                        renderOrderStatusCard("reached", "/image/order_reached.gif", "Arriving in your location", "Your order has Reached your location. The delivery partner will deliver it soon.")
                    ) : null}

                    <Card sx={{ mb: 1, borderRadius: 2 }}>
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
                        <Card sx={{ mb: 1, borderRadius: 2 }}>
                            <CardContent>
                                <Skeleton variant="rectangular" width="100%" sx={{ borderRadius: 2 }} height={100} />
                            </CardContent>
                        </Card>
                    ) : orderDetails?.status === "preparing" || orderDetails?.status === "on_the_way" || orderDetails?.status === "reached" ? (
                        <Card sx={{ mb: 1, borderRadius: 2, overflow: "hidden" }}>
                            <CardContent>
                                <Grid container spacing={1} alignItems="center">
                                    <Grid item>
                                        <DirectionsBikeIcon color="error" sx={{ fontSize: 30 }} />
                                    </Grid>
                                    <Grid item xs>
                                        <Typography variant="h6">
                                            Your Delivery partner is
                                            <span style={{ color: "#f27474", fontWeight: "bold" }}>
                                                {" "} {deliveryPartner?.name} {" "}
                                            </span>
                                            coming with {deliveryPartner?.delivery_mode} vehicle number :
                                            <span style={{ color: "#0f85d9", fontWeight: "bold" }}>
                                                {" "} {deliveryPartner?.vehicle_number} {" "}
                                            </span>.
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body1">
                                                <strong>Partner Number:</strong> {deliveryPartner?.number}
                                            </Typography>
                                            <IconButton
                                                color="success"
                                                onClick={() => window.location.href = `tel:${deliveryPartner?.number}`}
                                                sx={{ border: "1px solid", borderColor: "success" }}
                                            >
                                                <PhoneIcon />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card sx={{ mb: 1, borderRadius: 2 }}>
                            <CardContent>
                                <Grid container spacing={1} alignItems="center">
                                    <Grid item>
                                        <RoomIcon color="warning" sx={{ fontSize: 30 }} />
                                    </Grid>
                                    <Grid item xs>
                                        <Typography variant="h6" fontWeight="bold">
                                            Delivery partner will be assigned after packing.
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Your Amo Market Shop is only 3 km away. Learn about delivery partner safety.
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <ShieldIcon color="success" sx={{ fontSize: 30 }} />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    )}

                    <Card sx={{ mb: 1, borderRadius: 2 }}>
                        <CardContent>
                            <Grid container alignItems="center" spacing={1}>
                                <Grid item>
                                    <Avatar sx={{ bgcolor: "#f0f4ff" }}>
                                        <DeliveryScooterIcon color="primary" />
                                    </Avatar>
                                </Grid>
                                <Grid item xs>
                                    <Typography variant="h6" fontWeight="bold">
                                        Your delivery details
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Details of your current order
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Divider sx={{ my: 2 }} />
                            <Grid container alignItems="flex-start" spacing={1}>
                                <Grid item>
                                    <Avatar sx={{ bgcolor: "#e6f7e6" }}>
                                        <LocationOnIcon color="success" />
                                    </Avatar>
                                </Grid>
                                <Grid item xs>
                                    <Typography fontWeight="bold">Delivery at Home</Typography>
                                    <Typography color="textSecondary" noWrap>
                                        {cartUserAddress?.building_details
                                            ? cartUserAddress.building_details.slice(0, 35) + (cartUserAddress.building_details.length > 35 ? "..." : "")
                                            : ""}
                                    </Typography>
                                    <Typography color="primary" fontSize="small" sx={{ mt: 0.5 }}>
                                        Change address
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Box sx={{ bgcolor: "#fff8e6", p: 1.5, mt: 1, borderRadius: 1, display: "flex", alignItems: "center" }}>
                                <Typography color="textSecondary" fontSize="small" sx={{ flexGrow: 1 }}>
                                    Now update your address effortlessly if you've ordered at an incorrect location
                                </Typography>
                                <Button variant="contained" size="small" sx={{ ml: 1 }}>
                                    OK
                                </Button>
                            </Box>
                            <Grid container alignItems="flex-start" spacing={1} sx={{ mt: 1 }}>
                                <Grid item>
                                    <Avatar sx={{ bgcolor: "#e6f7e6" }}>
                                        <PhoneIcon color="success" />
                                    </Avatar>
                                </Grid>
                                <Grid item xs>
                                    <Typography fontWeight="bold">
                                        {cartUserAddress?.full_name},{" "}
                                        {cartUserAddress?.phone_number
                                            ? cartUserAddress.phone_number.slice(0, -4) + "XXXX"
                                            : ""}
                                    </Typography>
                                    <Typography color="primary" fontSize="small" sx={{ mt: 0.5 }}>
                                        Update receiver's contact
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Card sx={{ mb: 1, borderRadius: 2 }}>
                        <CardContent>
                            {loading ? (
                                <Grid container alignItems="center" spacing={1}>
                                    <Grid item>
                                        <Skeleton variant="circular" width={40} sx={{ borderRadius: 4 }} height={40} />
                                    </Grid>
                                    <Grid item xs>
                                        <Skeleton variant="text" width="70%" sx={{ borderRadius: 4 }} height={24} />
                                        <Skeleton variant="text" width="50%" sx={{ borderRadius: 4 }} height={20} />
                                    </Grid>
                                    <Grid item>
                                        <Skeleton variant="circular" width={40} sx={{ borderRadius: 4 }} height={40} />
                                    </Grid>
                                </Grid>
                            ) : (
                                <Grid container alignItems="center" spacing={1}>
                                    <Grid item>
                                        <Avatar sx={{ bgcolor: "#f4f9ff" }}>
                                            <ChatBubbleOutlineIcon color="primary" />
                                        </Avatar>
                                    </Grid>
                                    <Grid item xs>
                                        <Typography variant="h6" fontWeight="bold">
                                            Need help?
                                        </Typography>
                                        <Typography color="textSecondary" fontSize="small">
                                            Chat with us about any issue related to your order
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <IconButton>
                                            <ChatBubbleOutlineIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            )}
                        </CardContent>
                    </Card>

                    <Card sx={{ borderRadius: 2 }}>
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
                                        {cartItems.map((item, index) => (
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
                                                }}
                                            >
                                                <img
                                                    src={item.product.image}
                                                    alt={`Product ${index + 1}`}
                                                    style={{ width: "100%", height: "auto" }}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Dialog>
    );
};

export default OrderModel;
