import React, { useEffect, useState } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { useSweetAlert } from '../Theme/SweetAlert';
import useRazorpayScript from "./useRazorpayScript";

const RazorpayPaymentUI = ({ selectedMethod, onClose, apiUrl, onOrderCreated }) => {
    const showAlert = useSweetAlert();
    const [isLoading, setIsLoading] = useState(true);
    const [paymentInitialized, setPaymentInitialized] = useState(false);
    const scriptLoaded = useRazorpayScript();

    useEffect(() => {
        if (!scriptLoaded || paymentInitialized) return;

        const initializePayment = async () => {
            try {
                await initiateRazorpayPayment();
                setPaymentInitialized(true);
            } catch (error) {
                console.error("Payment initialization error:", error);
                setIsLoading(false);
            }
        };

        initializePayment();
    }, [scriptLoaded, paymentInitialized]);

    const showPaymentSuccessAlert = async (paymentId) => {
        const result = await showAlert({
            title: "Payment Received",
            text: `Your payment was successful!\nOrder confirmation is pending.\nReference: ${paymentId}`,
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "Contact Support",
            confirmButtonText: "Continue Shopping",
            customContent: (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <button
                        onClick={() => navigator.clipboard.writeText(paymentId)}
                        style={{
                            padding: '6px 12px',
                            border: '1px solid #9F63FF',
                            borderRadius: '4px',
                            background: 'transparent',
                            color: '#9F63FF',
                            cursor: 'pointer',
                            marginTop: '8px'
                        }}
                    >
                        Copy Reference ID
                    </button>
                </Box>
            )
        });

        if (result) {
            onClose();
        } else {
            // Handle contact support action
            window.location.href = "/contact-support";
        }
    };

    const showPaymentFailedAlert = (error) => {
        showAlert({
            title: "Payment Failed",
            text: `${error.description || "Payment could not be completed"}\nError code: ${error.code}`,
            icon: "error",
            confirmButtonText: "OK",
            footer: '<a href="/help/payments">Need help with payments?</a>'
        });
    };

    const showPaymentErrorAlert = (error) => {
        showAlert({
            title: "Payment Error",
            text: error.message || "Failed to initialize payment",
            icon: "error",
            confirmButtonText: "OK",
            footer: '<a href="/help">Contact support</a>'
        });
    };

    const initiateRazorpayPayment = async () => {
        try {
            const portal_token = localStorage.getItem("portal_token");
            if (!portal_token) {
                throw new Error("User not authenticated");
            }

            // Fetch cart data
            const cartResponse = await fetch(`${apiUrl}/portal/user/cart/last-record`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${portal_token}`,
                },
            });

            if (!cartResponse.ok) {
                const errorData = await cartResponse.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to load cart items");
            }

            const cartData = await cartResponse.json();
            const cartItems = JSON.parse(cartData.cart_items);

            // Get unique shop IDs from cart items
            const shopIds = [...new Set(cartItems.map(item => item.shop_id))];

            const payload = {
                total_amount: cartData.grand_total,
                currency: "INR",
                payment_method: selectedMethod,
                address_id: cartData.address_id,
                user_cart_id: cartData.id,
                order_status: "pending",
                shop_ids: shopIds,
                cart_items: cartItems // Include cart items for shop-specific processing
            };

            const amountInPaise = Math.round(Number(payload.total_amount) * 100);

            const options = {
                key: "rzp_test_jLql3MIe1aTEIh", // Replace with your actual key
                amount: amountInPaise,
                currency: payload.currency,
                name: "Amo Market",
                description: "Order Payment",
                image: "/favicon.ico",
                handler: async function (response) {
                    try {
                        const orderPayload = {
                            ...payload,
                            payment_id: response.razorpay_payment_id,
                            payment_status: "success",
                        };

                        const orderResponse = await fetch(
                            `${apiUrl}/portal/user/orders/store_order_details`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${portal_token}`,
                                },
                                body: JSON.stringify(orderPayload),
                            }
                        );

                        const orderData = await orderResponse.json();

                        if (!orderResponse.ok) {
                            throw new Error(orderData.message || `Server error: ${orderResponse.status}`);
                        }

                        if (!orderData?.order?.id) {
                            throw new Error("Invalid order response format");
                        }

                        window.dispatchEvent(new CustomEvent('cartChange', { detail: orderData }));
                        onOrderCreated(orderData.order.id);
                        onClose();

                    } catch (error) {
                        console.error("Order processing error:", error);

                        // Store payment details as fallback
                        localStorage.setItem('pending_order', JSON.stringify({
                            payment_id: response.razorpay_payment_id,
                            payload: payload,
                            error: error.message,
                            timestamp: new Date().toISOString()
                        }));

                        await showPaymentSuccessAlert(response.razorpay_payment_id);
                    } finally {
                        setIsLoading(false);
                    }
                },
                prefill: {
                    name: localStorage.getItem("user_name") || "Customer",
                    email: localStorage.getItem("user_email") || "customer@example.com",
                    contact: localStorage.getItem("user_phone") || "9999999999",
                },
                notes: {
                    order_type: "portal_order",
                    platform: "web_portal"
                },
                theme: {
                    color: "#9F63FF",
                },
            };

            const rzp = new window.Razorpay(options);

            rzp.on("payment.failed", function (response) {
                console.error("Payment failed:", response.error);
                showPaymentFailedAlert(response.error);
                setIsLoading(false);
            });

            rzp.open();

        } catch (error) {
            console.error("Payment initialization error:", error);
            showPaymentErrorAlert(error);
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Processing {selectedMethod} Payment
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
                You'll be redirected to Razorpay's secure payment page
            </Typography>

            {isLoading && (
                <Box sx={{ mt: 3 }}>
                    <Skeleton variant="rectangular" width="100%" height={50} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" width="80%" height={30} />
                    <Skeleton variant="rectangular" width="90%" height={30} sx={{ mt: 1 }} />
                </Box>
            )}
        </Box>
    );
};

export default RazorpayPaymentUI;
