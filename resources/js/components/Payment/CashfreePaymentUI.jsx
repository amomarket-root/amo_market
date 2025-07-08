import React, { useState, useEffect } from "react";
import { Box, Typography, Skeleton, Button } from "@mui/material";
import { useSweetAlert } from '../Theme/SweetAlert';
import axios from 'axios';

const CashfreePaymentUI = ({ selectedMethod, onClose, apiUrl, onPaymentSuccess }) => {
    const showAlert = useSweetAlert();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const initializePayment = async () => {
        try {
            setIsLoading(true);
            const portal_token = localStorage.getItem("portal_token");
            if (!portal_token) {
                throw new Error("Please login to proceed with payment");
            }

            // Get user cart data
            const cartResponse = await axios.get(`${apiUrl}/portal/user/cart/last-record`, {
                headers: {
                    Authorization: `Bearer ${portal_token}`,
                },
            });

            const cartData = cartResponse.data;

            // Create Cashfree payment order
            const paymentResponse = await axios.post(`${apiUrl}/portal/cashfree/create-order`, {
                name: cartData.user.name,
                email: cartData.user.email,
                phone: cartData.user.number || '0000000000',
                amount: cartData.grand_total,
                user_cart_id: cartData.id // Changed to user_cart_id
            }, {
                headers: {
                    Authorization: `Bearer ${portal_token}`,
                }
            });

            if (paymentResponse.data.success && paymentResponse.data.payment_link) {
                // Redirect to Cashfree payment page
                window.location.href = paymentResponse.data.payment_link;
            } else {
                throw new Error(paymentResponse.data.message || 'Failed to create payment order');
            }
        } catch (error) {
            console.error("Payment initialization error:", error);
            setError(error.response?.data?.message || error.message);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        initializePayment();
    }, []);

    const handleRetry = () => {
        setError(null);
        initializePayment();
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Processing {selectedMethod} Payment
            </Typography>

            {error ? (
                <Box>
                    <Typography color="error" gutterBottom>
                        {error}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleRetry}
                        sx={{ mt: 2 }}
                    >
                        Retry Payment
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        sx={{ mt: 2, ml: 2 }}
                    >
                        Cancel
                    </Button>
                </Box>
            ) : isLoading ? (
                <>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Redirecting to secure payment page...
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                        <Skeleton variant="rectangular" width="100%" height={50} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" width="80%" height={30} />
                        <Skeleton variant="rectangular" width="90%" height={30} sx={{ mt: 1 }} />
                    </Box>
                </>
            ) : null}
        </Box>
    );
};

export default CashfreePaymentUI;
