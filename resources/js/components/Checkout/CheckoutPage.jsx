import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOrderContext } from '../Order/OrderContext';
import { useSweetAlert } from '../Theme/SweetAlert';
import axios from 'axios';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openOrderModel } = useOrderContext();
    const showAlert = useSweetAlert();
    const apiUrl = import.meta.env.VITE_API_URL;
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const processPayment = async () => {
            const params = new URLSearchParams(location.search);
            const orderId = params.get('order_id');
            const orderToken = params.get('order_token');

            if (!orderId || !orderToken) {
                setIsProcessing(false);
                navigate('/');
                return;
            }

            try {
                const portal_token = localStorage.getItem("portal_token");

                // Verify payment with backend
                const verifyResponse = await axios.get(`${apiUrl}/portal/cashfree/success`, {
                    params: { order_id: orderId },
                    headers: portal_token ? {
                        Authorization: `Bearer ${portal_token}`,
                    } : {}
                });

                if (!verifyResponse.data.success) {
                    throw new Error(verifyResponse.data.message || 'Payment verification failed');
                }

                // Get cart data to create order
                const cartResponse = await axios.get(`${apiUrl}/portal/user/cart/last-record`, {
                    headers: {
                        Authorization: `Bearer ${portal_token}`,
                    },
                });

                const cartData = cartResponse.data;
                const cartItems = JSON.parse(cartData.cart_items);
                const shopIds = [...new Set(cartItems.map(item => item.shop_id))];

                // Prepare order payload
                const orderPayload = {
                    total_amount: cartData.grand_total,
                    currency: "INR",
                    payment_method: "Cashfree",
                    payment_id: verifyResponse.data.payment_id || orderId,
                    payment_status: "success",
                    address_id: cartData.address_id,
                    user_cart_id: cartData.id,
                    order_status: "pending",
                    shop_ids: shopIds,
                    cart_items: cartItems
                };

                // Create order in backend
                const orderResponse = await axios.post(
                    `${apiUrl}/portal/user/orders/store_order_details`,
                    orderPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${portal_token}`,
                        }
                    }
                );

                if (orderResponse.data?.order?.id) {
                    // Clear URL parameters
                    window.history.replaceState({}, document.title, '/');
                    setIsProcessing(false);

                    // Open order model first
                    openOrderModel(orderResponse.data.order.id);

                    // Then show success alert after a small delay
                    setTimeout(() => {
                        showAlert({
                            title: "Order Generated!",
                            text: `Your order #${orderResponse.data.order.id} has been generated successfully.
                                   Please wait while the shop confirms your order.`,
                            icon: "success",
                            timer: 4000
                        });
                    }, 500);
                } else {
                    throw new Error("Failed to create order");
                }
            } catch (error) {
                setIsProcessing(false);
                console.error("Payment processing error:", error);

                // Show error alert
                setTimeout(() => {
                    showAlert({
                        title: "Payment Error",
                        text: error.message || "Failed to process payment",
                        icon: "error",
                        timer: 4000
                    });
                }, 500);

                navigate('/');
            }
        };

        processPayment();
    }, [location.search, navigate, openOrderModel, showAlert, apiUrl]);

    if (isProcessing) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    width: '100vw',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    zIndex: 9999
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
                    <img
                        src="/image/loader.gif"
                        alt="Loading..."
                        style={{
                            width: '100px',
                            height: '100px',
                            marginBottom: '20px',
                        }}
                    />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Processing your payment...
                    </h2>
                    <p>Please wait while we confirm your order</p>
                </div>
            </div>
        );
    }

    return null;
};

export default CheckoutPage;
