import React, { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { CartProvider } from '../Cart/CartContext';
import { OrderProvider } from '../Order/OrderContext';
import { LocationContext, LocationProvider } from '../Location/LocationContext';

// Lazy load all components
const Layout = lazy(() => import('../Theme/Layout'));
const LandingPage = lazy(() => import('../Home/LandingPage'));
const NotFoundPage = lazy(() => import('./NotFoundPage'));
const CartButtonLayout = lazy(() => import('../Cart/CartButtonLayout'));
const AccountPage = lazy(() => import('../Account/AccountPage'));
const AllProduct = lazy(() => import('../Product/AllProduct'));
const ProductDetails = lazy(() => import('../Product/ProductDetails'));
const SubCategoryWiseProduct = lazy(() => import('../Product/SubCategoryWiseProduct'));
const OrderHistoryPage = lazy(() => import('../Account/OrderHistoryPage'));
const AddressBookPage = lazy(() => import('../Account/AddressBookPage'));
const GeneralInfoPage = lazy(() => import('../Account/GeneralInfoPage'));
const NotificationPage = lazy(() => import('../Account/NotificationPage'));
const OrderSummaryPage = lazy(() => import('../Account/OrderSummaryPage'));
const AccountPrivacy = lazy(() => import('../Account/AccountPrivacy'));
const DeleteAccountPage = lazy(() => import('../Account/DeleteAccountPage'));
const OrderButtonLayout = lazy(() => import('../Order/OrderButtonLayout'));
const GetSupportPage = lazy(() => import('../Account/GetSupportPage'));
const ChatSupportPage = lazy(() => import('../Account/ChatSupportPage'));
const SeeAllShop = lazy(() => import('../Shop/SeeAllShop'));
const ShopProductList = lazy(() => import('../Shop/ShopProductList'));
const UserFeedback = lazy(() => import('../Feedback/UserFeedback'));
const CartModel = lazy(() => import('../Cart/CartModel'));
const OrderModel = lazy(() => import('../Order/OrderModel'));
const AboutUsPage = lazy(() => import('../Information/AboutUsPage'));
const PrivacyPage = lazy(() => import('../Information/PrivacyPage'));
const TermsPage = lazy(() => import('../Information/TermsPage'));
const CareersPage = lazy(() => import('../Information/CareersPage'));
const SecurityPage = lazy(() => import('../Information/SecurityPage'));
const ShopPageInfo = lazy(() => import('../Information/ShopPageInfo'));
const DeliveryPageInfo = lazy(() => import('../Information/DeliveryPageInfo'));
const BlogPage = lazy(() => import('../Information/BlogPage'));
const BlogDetailsPage = lazy(() => import('../Information/BlogDetailsPage'));
const CheckoutPage = lazy(() => import('../Checkout/CheckoutPage'));

const PortalRoutes = () => {
    const location = useLocation();

    useEffect(() => {
        ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
    }, [location]);

    return (
        <Suspense fallback={
            <div className="loader-container">
                <img src="/image/loader.gif" alt="Loading..." className="loader" />
            </div>
        }>
            <LocationProvider>
                <CartProvider>
                    <OrderProvider>
                        <Routes>
                            <Route path="/" element={
                                <Layout>
                                    <CartButtonLayout>
                                        <OrderButtonLayout>
                                            <LandingPage />
                                        </OrderButtonLayout>
                                    </CartButtonLayout>
                                    <CartModel />
                                    <OrderModel />
                                </Layout>
                            } />
                            <Route path="*" element={<NotFoundPage />} />

                            {/* Static Pages */}
                            <Route path="/about_us" element={<Layout><AboutUsPage /></Layout>} />
                            <Route path="/privacy" element={<Layout><PrivacyPage /></Layout>} />
                            <Route path="/careers" element={<Layout><CareersPage /></Layout>} />
                            <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
                            <Route path="/security" element={<Layout><SecurityPage /></Layout>} />
                            <Route path="/blog" element={<Layout><BlogPage /></Layout>} />
                            <Route path="/blog_details/:blogId" element={<Layout><BlogDetailsPage /></Layout>} />
                            <Route path="/shop-info" element={<Layout><ShopPageInfo /></Layout>} />
                            <Route path="/delivery-info" element={<Layout><DeliveryPageInfo /></Layout>} />
                            {/* CheckOut Routes */}
                            <Route path="/checkout" element={
                                <Layout>
                                    <CartButtonLayout>
                                        <OrderButtonLayout>
                                            <CheckoutPage />
                                        </OrderButtonLayout>
                                    </CartButtonLayout>
                                    <CartModel />
                                    <OrderModel />
                                </Layout>
                            } />
                            {/* Product Routes */}
                            <Route path="/all_product/:categoryId" element={
                                <Layout>
                                    <CartButtonLayout>
                                        <OrderButtonLayout>
                                            <AllProduct />
                                        </OrderButtonLayout>
                                    </CartButtonLayout>
                                </Layout>
                            } />
                            <Route path="/product-details/:productId" element={
                                <Layout>
                                    <CartButtonLayout>
                                        <OrderButtonLayout>
                                            <ProductDetails />
                                        </OrderButtonLayout>
                                    </CartButtonLayout>
                                </Layout>
                            } />
                            <Route path="/all_product/subcategory/:categoryId" element={
                                <Layout>
                                    <CartButtonLayout>
                                        <OrderButtonLayout>
                                            <SubCategoryWiseProduct />
                                        </OrderButtonLayout>
                                    </CartButtonLayout>
                                </Layout>
                            } />

                            {/* Shop Routes */}
                            <Route path="/see_all_shop" element={
                                <Layout>
                                    <CartButtonLayout>
                                        <OrderButtonLayout>
                                            <SeeAllShop />
                                        </OrderButtonLayout>
                                    </CartButtonLayout>
                                </Layout>
                            } />
                            <Route path="/shop_product_list/:shopId/:shopPertainType" element={
                                <Layout>
                                    <CartButtonLayout>
                                        <OrderButtonLayout>
                                            <ShopProductList />
                                        </OrderButtonLayout>
                                    </CartButtonLayout>
                                </Layout>
                            } />

                            {/* Feedback */}
                            <Route path="/user_feedback" element={<Layout><UserFeedback /></Layout>} />

                            {/* Account Routes */}
                            <Route path="/account" element={<Layout><AccountPage /></Layout>}>
                                <Route path="order-history" element={<OrderHistoryPage />} />
                                <Route path="order-summary/:orderId" element={<OrderSummaryPage />} />
                                <Route path="address-book" element={<AddressBookPage />} />
                                <Route path="support" element={<GetSupportPage />} />
                                <Route path="chat-support" element={<ChatSupportPage />} />
                                <Route path="account-privacy" element={<AccountPrivacy />} />
                                <Route path="delete-account" element={<DeleteAccountPage />} />
                                <Route path="notification" element={<NotificationPage />} />
                                <Route path="general-info" element={<GeneralInfoPage />} />
                            </Route>
                        </Routes>
                    </OrderProvider>
                </CartProvider>
            </LocationProvider>
        </Suspense>
    );
};

export default PortalRoutes;
