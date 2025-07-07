import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import axios from 'axios';
import { addToCart } from './cartService';
import AddressModel from '../Address/AddressModel';
import PaymentMethodsModel from '../Payment/PaymentMethodsModel';
import CartItem from './CartItem';
import BillDetails from './BillDetails';
import FeedingIndiaDonation from './FeedingIndiaDonation';
import IndiaArmedForceContribution from './IndiaArmedForceContribution';
import TipSection from './TipSection';
import CancellationPolicy from './CancellationPolicy';
import { useCart } from './CartContext';
import { LocationContext } from '../Location/LocationContext';
import { useSweetAlert } from '../Theme/SweetAlert';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
});

const CartModal = () => {
    const { cartModalOpen, closeCartModal, setCartItemsCount } = useCart();
    const { latitude: userLat, longitude: userLng } = useContext(LocationContext);
    const showAlert = useSweetAlert();
    const theme = useTheme();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [openAddressModel, setOpenAddressModel] = useState(false);
    const [openPaymentMethodsModel, setOpenPaymentMethodsModel] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [deliveryCharge, setDeliveryCharge] = useState(0);
    const [platformCharge, setPlatformCharge] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);
    const [emptyCart, setEmptyCart] = useState(false);
    const [feedingIndiaDonation, setFeedingIndiaDonation] = useState(0);
    const [indiaArmedForceContribution, setIndiaArmedForceContribution] = useState(0);
    const [tipAmount, setTipAmount] = useState(0);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [distance, setDistance] = useState(0);
    const [baseDeliveryCharge, setBaseDeliveryCharge] = useState(10);
    const [minDeliveryCharge, setMinDeliveryCharge] = useState(20); // Minimum delivery charge
    const [distanceWarning, setDistanceWarning] = useState(false);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    const calculateDeliveryCharge = (distance) => {
        // Minimum charge for distances <= 1 km
        if (distance <= 1) {
            return minDeliveryCharge;
        }

        // For distances > 1 km, charge base rate * distance
        const charge = Math.round(baseDeliveryCharge * distance);

        // Ensure charge is at least the minimum
        return Math.max(charge, minDeliveryCharge);
    };

    const fetchCartItems = useCallback(async () => {
        try {
            const portal_token = localStorage.getItem('portal_token');
            if (!portal_token) {
                console.log('User is not authenticated');
                return;
            }
            const response = await axios.get(`${apiUrl}/portal/cart`, {
                headers: {
                    Authorization: `Bearer ${portal_token}`
                }
            });
            const data = response.data.data;
            console.log('Cart data:', data);
            setCartItems(data.cartItems ?? []);
            setCartItemsCount(data.cartItems?.length ?? 0);
            setTotalAmount(data.totalAmount ?? 0);
            setDeliveryCharge(data.deliveryCharge ?? 0);
            setPlatformCharge(data.platformCharge ?? 0);
            setGrandTotal(data.grandTotal ?? 0);
            setEmptyCart(false);
        } catch (error) {
            const errorData = error.response.data;
            if (errorData.status === false || errorData.message === 'Your cart is empty') {
                setEmptyCart(true);
                setCartItemsCount(0);
            }
        } finally {
            setLoading(false);
        }
    }, [apiUrl, setCartItemsCount]);

    useEffect(() => {
        if (cartModalOpen) {
            setLoading(true);
            fetchCartItems();
        }
    }, [cartModalOpen, fetchCartItems]);

    const updateCartItemQuantity = async (id, delta) => {
        const item = cartItems.find((item) => item.id === id);
        if (!item) return;

        const isService = !!item.service_id;

        if (isService) {
            try {
                const portal_token = localStorage.getItem('portal_token');
                await axios.delete(`${apiUrl}/portal/cart/remove-service/${item.service_id}`, {
                    headers: { Authorization: `Bearer ${portal_token}` }
                });

                const updatedItems = cartItems.filter((item) => item.id !== id);
                setCartItems(updatedItems);
                setCartItemsCount(updatedItems.length);
                setEmptyCart(updatedItems.length === 0);
                return;
            } catch (err) {
                console.error('Error removing service from cart:', err);
                return;
            }
        }

        const updatedItems = cartItems.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + delta } : item
        );
        const filteredItems = updatedItems.filter((item) => item.quantity > 0);

        setCartItems(filteredItems);
        setCartItemsCount(filteredItems.length);

        try {
            const itemToUpdate = filteredItems.find(item => item.id === id) || item;
            await addToCart(itemToUpdate.product_id, delta, 'product');
            setEmptyCart(filteredItems.length === 0);
        } catch (err) {
            setCartItems(cartItems);
            setCartItemsCount(cartItems.length);
            console.error('Error updating cart item quantity:', err);
        }
    };

    const handleIncrease = (id) => updateCartItemQuantity(id, 1);
    const handleDecrease = (id) => updateCartItemQuantity(id, -1);
    const handleAdd = (id) => updateCartItemQuantity(id, 1);

    useEffect(() => {
        const newSubtotal = cartItems.reduce((sum, item) => {
            return sum + (item?.quantity * parseFloat(item.price || 0));
        }, 0);

        const numericDeliveryCharge = parseFloat(deliveryCharge || 0);
        const numericPlatformCharge = parseFloat(platformCharge || 0);
        const numericFeedingIndiaDonation = parseFloat(feedingIndiaDonation || 0);
        const numericIndiaArmedForceContribution = parseFloat(indiaArmedForceContribution || 0);
        const numericTipAmount = parseFloat(tipAmount || 0);

        setSubtotal(newSubtotal);
        setTotalAmount(newSubtotal);

        const newGrandTotal = newSubtotal +
            numericDeliveryCharge +
            numericPlatformCharge +
            numericFeedingIndiaDonation +
            numericIndiaArmedForceContribution +
            numericTipAmount;

        setGrandTotal(newGrandTotal.toFixed(2));

    }, [cartItems, deliveryCharge, platformCharge, feedingIndiaDonation, indiaArmedForceContribution, tipAmount]);

    const handleOpenAddressModel = () => {
        setOpenAddressModel(true);
    };

    const handleCloseAddressModel = () => {
        setOpenAddressModel(false);
    };

    const handleAddressSelect = async (address) => {
        console.log('Selected address:', address);
        setSelectedAddress(address);
        setOpenAddressModel(false);

        try {
            if (userLat && userLng && address.latitude && address.longitude) {
                const calculatedDistance = calculateDistance(
                    parseFloat(userLat),
                    parseFloat(userLng),
                    parseFloat(address.latitude),
                    parseFloat(address.longitude)
                );

                setDistance(calculatedDistance);

                // Calculate delivery charge with minimum amount
                const newDeliveryCharge = calculateDeliveryCharge(calculatedDistance);
                setDeliveryCharge(newDeliveryCharge);

                // Show warning if distance is more than 5 km
                if (calculatedDistance > 5) {
                    setDistanceWarning(true);
                    showAlert({
                        icon: "warning",
                        title: 'Long Distance Notice',
                        text: `This location is ${calculatedDistance.toFixed(2)} km away. Delivery may take longer than expected.`,
                        showConfirmButton: true,
                    });
                } else {
                    setDistanceWarning(false);
                }

                console.log(`Distance: ${calculatedDistance.toFixed(2)} km, Delivery charge: ₹${newDeliveryCharge.toFixed(2)}`);
            }

            const portal_token = localStorage.getItem('portal_token');
            if (!portal_token) {
                console.log('User is not authenticated');
                return;
            }

            const updatedGrandTotal = grandTotal;

            const cartData = {
                cart_items: JSON.stringify(cartItems),
                subtotal: subtotal,
                delivery_charge: deliveryCharge,
                platform_charge: platformCharge,
                grand_total: updatedGrandTotal,
                feeding_india_donation: feedingIndiaDonation,
                india_armed_force_contribution: indiaArmedForceContribution,
                tip_amount: tipAmount,
                status: 1,
                address_id: address.id,
            };

            const response = await axios.post(`${apiUrl}/portal/user/cart/store_cart_details`, cartData, {
                headers: {
                    Authorization: `Bearer ${portal_token}`
                }
            });

            if (response.data.status) {
                console.log('Cart data saved successfully with address:', address.id);
            } else {
                console.error('Failed to save cart data');
            }
        } catch (error) {
            console.error('Error saving cart data:', error);
        }
    };

    const handleOpenPaymentMethodsModel = async () => {
        if (distanceWarning) {
            const result = await showAlert({
                title: 'Long Distance Delivery',
                text: 'This location is far from our service area. Delivery may take longer than usual. Do you want to proceed?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Proceed',
                cancelButtonText: 'No, Change Address'
            });

            if (result) {
                setOpenPaymentMethodsModel(true);
            }
        } else {
            setOpenPaymentMethodsModel(true);
        }
    };

    const handleClosePaymentMethodsModel = () => {
        setOpenPaymentMethodsModel(false);
    };

    const handleStartShopping = () => {
        setCartItemsCount(0);
        closeCartModal();
        navigate('/');
    };

    return (
        <>
            <Dialog
                fullScreen={isMobile}
                open={cartModalOpen}
                onClose={closeCartModal}
                TransitionComponent={Transition}
                keepMounted
                sx={
                    !isMobile
                        ? {
                            '& .MuiDialog-paper': {
                                position: 'fixed',
                                right: 0,
                                margin: 0,
                                width: '30%',
                                height: '100vh',
                                maxHeight: '100vh',
                            },
                        }
                        : {}
                }
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <AppBar
                        sx={{
                            position: 'sticky',
                            top: 0,
                            backgroundColor: '#fff',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                            color: 'transparent',
                            borderBottomLeftRadius: '10px',
                            borderBottomRightRadius: '10px',
                            overflow: 'hidden',
                            zIndex: 10,
                        }}
                    >
                        <Toolbar style={{ marginBottom: 5, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
                            <Typography sx={{ ml: 2, flex: 1, color: "black", fontWeight: "bold" }} variant="h6" component="div">
                                My Cart
                            </Typography>
                            <IconButton
                                edge="start"
                                color="black"
                                onClick={closeCartModal}
                                aria-label="close"
                            >
                                <CloseIcon />
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    {emptyCart ? (
                        <Box
                            sx={{
                                flexGrow: 1,
                                overflowY: 'auto',
                                padding: '10px',
                                backgroundColor: '#f5f5f5',
                            }}
                        >
                            <Box sx={{
                                mt: 2,
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                padding: '16px',
                                boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                            }}>
                                <img
                                    src="/image/empty_cart.webp"
                                    alt="No Cart"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        marginBottom: '16px'
                                    }}
                                />
                                <h3 variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    Your cart is Empty
                                </h3>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Explore our ever growing selection of products and exciting new offers today!
                                </Typography>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        marginTop: 3,
                                        width: '50%',
                                        backgroundColor: '#10d915',
                                        color: '#fff',
                                        borderColor: '#0bd80f',
                                        '&:hover': {
                                            backgroundColor: '#0bd80f',
                                            borderColor: '#07ce0b',
                                        },
                                    }}
                                    onClick={handleStartShopping}
                                >
                                    Start Shopping
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <div>
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    overflowY: 'auto',
                                    padding: '10px',
                                    backgroundColor: '#f5f5f5',
                                }}
                            >
                                {loading ? (
                                    <Box sx={{ backgroundColor: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}>
                                        {[...Array(3)].map((_, index) => (
                                            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Skeleton variant="rectangular" width={50} height={50} sx={{ mr: 2 }} />
                                                    <Box>
                                                        <Skeleton variant="text" width={100} height={20} />
                                                        <Skeleton variant="text" width={80} height={16} />
                                                        <Skeleton variant="text" width={60} height={16} />
                                                    </Box>
                                                </Box>
                                                <Skeleton variant="rectangular" width={100} height={36} />
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{ backgroundColor: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <TimelapseIcon sx={{ mr: 1 }} />
                                            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Delivery in 20 minutes</Typography>
                                        </Box>
                                        <Divider />
                                        <div>
                                            {cartItems.map((cartItem) => (
                                                <CartItem
                                                    key={cartItem.id}
                                                    cartItem={cartItem}
                                                    handleIncrease={handleIncrease}
                                                    handleDecrease={handleDecrease}
                                                    handleAdd={handleAdd}
                                                />
                                            ))}
                                        </div>
                                    </Box>
                                )}

                                <BillDetails
                                    totalAmount={totalAmount}
                                    deliveryCharge={deliveryCharge}
                                    platformCharge={platformCharge}
                                    feedingIndiaDonation={feedingIndiaDonation}
                                    indiaArmedForceContribution={indiaArmedForceContribution}
                                    tipAmount={tipAmount}
                                    grandTotal={grandTotal}
                                    distance={distance}
                                />

                                <FeedingIndiaDonation
                                    feedingIndiaDonation={feedingIndiaDonation}
                                    setFeedingIndiaDonation={setFeedingIndiaDonation}
                                />

                                <IndiaArmedForceContribution
                                    indiaArmedForceContribution={indiaArmedForceContribution}
                                    setIndiaArmedForceContribution={setIndiaArmedForceContribution}
                                />

                                <TipSection
                                    tipAmount={tipAmount}
                                    setTipAmount={setTipAmount}
                                />

                                <CancellationPolicy />
                            </Box>

                            <Box
                                sx={{
                                    position: 'sticky',
                                    bottom: 0,
                                    backgroundColor: '#fff',
                                    padding: '16px',
                                    borderTopLeftRadius: '10px',
                                    borderTopRightRadius: '10px',
                                    boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                {selectedAddress && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <img
                                                src="/image/add_location.gif"
                                                alt="Location Icon"
                                                style={{ width: 40, height: 40, marginRight: 8 }}
                                            />
                                            <Box>
                                                <Tooltip title={selectedAddress.full_address}>
                                                    <Typography
                                                        variant="body2"
                                                        component="div"
                                                        style={{
                                                            textAlign: 'left',
                                                            fontWeight: 'bold',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            maxWidth: '100%'
                                                        }}
                                                    >
                                                        {selectedAddress.full_address}
                                                    </Typography>
                                                </Tooltip>

                                                {distance > 0 && (
                                                    <Typography variant="caption" sx={{ color: distance > 5 ? 'error.main' : 'text.secondary' }}>
                                                        {distance.toFixed(2)} km away {distance > 5 && '(Long distance)'}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        <Button
                                            variant="outlined"
                                            sx={{
                                                borderRadius: '12px',
                                                borderColor: 'green',
                                                color: 'green',
                                                '&:hover': {
                                                    borderColor: 'green',
                                                    backgroundColor: 'transparent',
                                                },
                                            }}
                                            onClick={handleOpenAddressModel}
                                        >
                                            Change
                                        </Button>
                                    </Box>
                                )}
                                <Button
                                    variant="contained"
                                    sx={{
                                        width: '100%',
                                        padding: '10px 0',
                                        borderRadius: '25px',
                                        backgroundColor: 'green',
                                        '&:hover': {
                                            backgroundColor: '#5a1bcc',
                                            borderColor: '#5a1bcc',
                                        }
                                    }}
                                    onClick={selectedAddress ? handleOpenPaymentMethodsModel : handleOpenAddressModel}
                                >
                                    {selectedAddress ? "Proceed to Payment" : "Please select an address"}
                                </Button>
                            </Box>
                        </div>
                    )}
                </Box>
            </Dialog>
            <AddressModel open={openAddressModel} onClose={handleCloseAddressModel} onAddressSelect={handleAddressSelect} />
            <PaymentMethodsModel
                open={openPaymentMethodsModel}
                onClose={handleClosePaymentMethodsModel}
                onPaymentSuccess={() => {
                    handleClosePaymentMethodsModel();
                    closeCartModal();
                }}
            />
        </>
    );
};

export default CartModal;
