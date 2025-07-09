import React, { useEffect, useState, useRef } from 'react';
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
    const processedOrderId = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const processPayment = async () => {
            const params = new URLSearchParams(location.search);
            const orderId = params.get('order_id');
            const orderToken = params.get('order_token');
            const userCartId = params.get('user_cart_id');

            if (!orderId || !orderToken || !userCartId) {
                setIsProcessing(false);
                showAlert({
                    title: "Payment Error",
                    text: "Missing payment parameters",
                    icon: "error"
                });
                navigate('/');
                return;
            }

            if (processedOrderId.current === orderId) {
                setIsProcessing(false);
                return;
            }

            try {
                const portal_token = localStorage.getItem("portal_token");
                if (!portal_token) {
                    throw new Error("Please login to continue");
                }

                const verifyResponse = await axios.get(`${apiUrl}/portal/cashfree/success`, {
                    params: {
                        order_id: orderId,
                        user_cart_id: userCartId
                    },
                    headers: {
                        Authorization: `Bearer ${portal_token}`
                    }
                });

                if (!verifyResponse.data.success) {
                    throw new Error(verifyResponse.data.message || 'Payment verification failed');
                }

                const cartResponse = await axios.get(`${apiUrl}/portal/user/cart/get-by-id/${userCartId}`, {
                    headers: { Authorization: `Bearer ${portal_token}` },
                });

                if (!cartResponse.data) {
                    throw new Error("User cart not found");
                }

                const cartData = cartResponse.data;
                const cartItems = JSON.parse(cartData.cart_items);
                const shopIds = [...new Set(cartItems.map(item => item.shop_id))];

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

                const orderResponse = await axios.post(
                    `${apiUrl}/portal/user/orders/store_order_details`,
                    orderPayload,
                    { headers: { Authorization: `Bearer ${portal_token}` } }
                );

                if (orderResponse.data?.order?.id && isMounted) {
                    processedOrderId.current = orderId;

                    // ✅ First navigate to home
                    navigate('/');

                    // ✅ Show alert after navigating
                    setTimeout(() => {
                        showAlert({
                            title: "Order Generated!",
                            text: `Your order has been generated successfully. Please wait for shop confirmation.`,
                            icon: "success",
                            timer: 4000,
                            showConfirmButton: false,
                            willClose: () => {
                                // ✅ Open order model after alert is closed
                                openOrderModel(orderResponse.data.order.id);
                            }
                        });

                        // ✅ If willClose doesn't trigger in some cases, use fallback timeout
                        setTimeout(() => {
                            openOrderModel(orderResponse.data.order.id);
                        }, 4100); // A bit more than alert timer to ensure fallback
                    }, 300); // Slight delay to ensure page has navigated

                    setIsProcessing(false);
                } else {
                    throw new Error("Failed to create order");
                }
            } catch (error) {
                if (isMounted) {
                    setIsProcessing(false);
                    console.error("Payment processing error:", error);
                    showAlert({
                        title: "Payment Error",
                        text: error.message || "Failed to process payment",
                        icon: "error"
                    });
                    navigate('/');
                }
            }
        };

        processPayment();

        return () => {
            isMounted = false;
        };
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
