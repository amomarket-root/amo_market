import React, { useEffect } from 'react';
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

    useEffect(() => {
        const processPayment = async () => {
            const params = new URLSearchParams(location.search);
            const orderId = params.get('order_id');
            const orderToken = params.get('order_token');
            const paymentStatus = params.get('payment_status');

            if (!orderId || !orderToken) {
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
                    payment_method: "Cashfree", // or use the actual method from verifyResponse
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

                    // Open order model and show success
                    openOrderModel(orderResponse.data.order.id);
                    showAlert({
                        title: "Order Placed!",
                        text: `Your order #${orderResponse.data.order.id} has been placed successfully.`,
                        icon: "success",
                        timer: 3000
                    });
                } else {
                    throw new Error("Failed to create order");
                }
            } catch (error) {
                console.error("Payment processing error:", error);
                showAlert({
                    title: "Payment Error",
                    text: error.message || "Failed to process payment",
                    icon: "error"
                });
                navigate('/');
            }
        };

        processPayment();
    }, [location.search]);

    return null; // This component doesn't render anything, it just processes the payment
};

export default CheckoutPage;
