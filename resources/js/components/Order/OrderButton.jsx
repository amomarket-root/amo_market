import React, { useState, useCallback, useEffect } from 'react';
import { Fab, Button, Box, Badge, Typography, Divider, IconButton } from '@mui/material';
import HourglassTopTwoToneIcon from '@mui/icons-material/HourglassTopTwoTone';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import NotificationsIcon from '@mui/icons-material/Notifications';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useOrderContext } from './OrderContext';

const OrderButton = () => {
    const theme = useTheme();
    const apiUrl = import.meta.env.VITE_API_URL;
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { orderButtonVisible, openOrderModel } = useOrderContext();

    const [orders, setOrders] = useState([]);
    const [expandOrders, setExpandOrders] = useState(false);

    const fetchOrderSummary = useCallback(async () => {
        const portal_token = localStorage.getItem('portal_token');
        if (!portal_token) {
            console.log('User is not authenticated');
            setOrders([]);
            return;
        }

        try {
            const response = await axios.get(`${apiUrl}/portal/order/summary`, { // Updated endpoint
                headers: { Authorization: `Bearer ${portal_token}` }
            });

            if (response.data.data) {
                // Filter out delivered orders
                const activeOrders = response.data.data.filter(order => order.order_status !== 'delivered');
                setOrders(activeOrders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Don't set empty array here to preserve existing orders during temporary failures
        }
    }, [apiUrl]);

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            setOrders([]);
            return;
        }

        const channel = window.Echo.channel(`notification_order_status_for_user.${userId}`);
        channel.listen('.order.status.notification', (data) => {
            if (data.status !== 'delivered') {
                setOrders((prevOrders) => {
                    // Update existing order or add new one
                    const existingIndex = prevOrders.findIndex(o => o.id === data.id);
                    if (existingIndex >= 0) {
                        const updated = [...prevOrders];
                        updated[existingIndex] = data;
                        return updated;
                    }
                    return [data, ...prevOrders];
                });
            } else {
                setOrders((prevOrders) => prevOrders.filter(order => order.id !== data.id));
            }
        });

        fetchOrderSummary();
       let intervalId;

        if (orders.length > 0) {
            intervalId = setInterval(fetchOrderSummary, 60000);
        }

        const handleOrderChange = () => fetchOrderSummary();
        window.addEventListener('orderChange', handleOrderChange);

        return () => {
            channel.unsubscribe();
            if (intervalId) clearInterval(intervalId);
            window.removeEventListener('orderChange', handleOrderChange);
        };
    }, [fetchOrderSummary]);

    const handleOpenOrderModal = (orderId) => {
        openOrderModel(orderId);
        setExpandOrders(false);
    };

    const getIconComponent = (status) => {
        switch (status) {
            case 'accepted':
            case 'preparing':
                return StorefrontIcon;
            case 'on_the_way':
            case 'reached':
                return DirectionsBikeIcon;
            default:
                return HourglassTopTwoToneIcon;
        }
    };

    if (!orderButtonVisible || orders.length === 0) return null;

    return (
        <Box sx={{
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            maxWidth: '400px'
        }}>
            <Badge
                badgeContent={orders.length > 1 ? orders.length : null}
                color="error"
                overlap="circular"
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Fab
                    variant="extended"
                    color="error"
                    sx={{
                        backgroundColor: '#f27474',
                        display: 'flex',
                        alignItems: 'flex-start',
                        minWidth: isMobile ? '360px' : '400px',
                        height: expandOrders ? 'auto' : isMobile ? '65px' : '70px',
                        fontSize: isMobile ? '1rem' : '1.2rem',
                        padding: '12px',
                        flexDirection: 'column',
                        // alignItems: 'stretch',
                        position: 'relative'
                    }}
                >
                    {expandOrders ? (
                        orders.map((order, index) => {
                            const IconComponent = getIconComponent(order.status);
                            return (
                                <React.Fragment key={order.id}>
                                    {index > 0 && <Divider sx={{ my: 1, backgroundColor: 'white' }} />}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            color: 'white',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <IconComponent sx={{
                                                color: 'white',
                                                fontSize: '24px',
                                                marginRight: '8px'
                                            }} />
                                            <Box>
                                                <Typography variant="body2" noWrap>
                                                    Order is {order.order_status?.replace(/_/g, ' ')}
                                                </Typography>
                                                <Typography variant="body2" fontWeight="bold" noWrap>
                                                    Amount: ₹{order.total_amount}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Button
                                            size="small"
                                            sx={{
                                                backgroundColor: 'white',
                                                color: 'red',
                                                fontWeight: 'bold',
                                                borderRadius: '20px',
                                                ml: 2,
                                                '&:hover': {
                                                    backgroundColor: '#f5f5f5',
                                                }
                                            }}
                                            onClick={() => handleOpenOrderModal(order.id)}
                                        >
                                            View Order
                                        </Button>
                                    </Box>
                                </React.Fragment>
                            );
                        })
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                            }}
                            onClick={() => handleOpenOrderModal(orders[0].id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Box
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    padding: '4px',
                                    borderRadius: '20%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '10px',
                                }}
                            >
                                {orders.length > 0 && (() => {
                                    const IconComponent = getIconComponent(orders[0].status);
                                    return <IconComponent sx={{ color: 'white', fontSize: '24px' }} />;
                                })()}
                            </Box>
                            <Box sx={{
                                color: 'white',
                                flexGrow: 1,
                                textAlign: 'left'
                            }}>
                                <Typography variant="body2" noWrap>
                                    Order is {orders[0].order_status?.replace(/_/g, ' ')}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" noWrap>
                                    Amount: ₹{orders[0].total_amount}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    color: 'red',
                                    fontWeight: 'bold',
                                    fontSize: isMobile ? '14px' : '16px',
                                    padding: '4px 16px',
                                    borderRadius: '20px',
                                    backgroundColor: 'white',
                                }}
                            >
                                View Order
                            </Box>
                        </Box>
                    )}
                </Fab>
            </Badge>

            {orders.length > 1 && !expandOrders && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '-12px',
                        right: '-12px',
                        zIndex: 2001,
                    }}
                    onClick={() => setExpandOrders(true)}
                >
                    <IconButton
                        size="small"
                        sx={{
                            backgroundColor: 'white',
                            boxShadow: 2,
                            padding: '6px',
                            '&:hover': {
                                backgroundColor: '#f5f5f5',
                            },
                        }}
                    >
                        <Badge
                            badgeContent={orders.length}
                            color="error"
                            sx={{
                                '& .MuiBadge-badge': {
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    top: 4,
                                    right: 4,
                                    color: 'white',
                                },
                            }}
                        >
                            <NotificationsIcon color="error" />
                        </Badge>
                    </IconButton>
                </Box>
            )}
        </Box>
    );
};

export default OrderButton;
