import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Container, Grid } from '@mui/material';
import { LocationContext } from '../Location/LocationContext';
import Theme from '../Theme/Theme';
import { ThemeProvider } from '@mui/material/styles';
import axios from "axios";
import { addToCart } from '../Cart/cartService';
import {
    getCartItemsFromLocalStorage,
    updateLocalCartItems,
    mergeProductsWithCart,
    getCartSummary
} from '../Cart/cartHelpers';
import LoginModal from '../Auth/LoginModal';
import CartButton from '../Cart/CartButton';
import { ShopHeader } from './ShopHeader';
import { ProductGrid } from './ProductGrid';
import { ServiceRenderer } from './ServiceRenderer';

function ShopProductList() {
    const navigate = useNavigate();
    const { shopId } = useParams();
    const { shopPertainType } = useParams();
    const { latitude, longitude } = useContext(LocationContext);
    const apiUrl = import.meta.env.VITE_API_URL;

    const [selectedShop, setSelectedShop] = useState('');
    const [sortBy, setSortBy] = useState('Relevance');
    const [shopProducts, setShopProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [noProductsMessage, setNoProductsMessage] = useState('');
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [shopType, setShopType] = useState('product');
    const [shopData, setShopData] = useState(null);
    const [cartVisible, setCartVisible] = useState(false);

    const fetchProductsByShopId = async (shopId, sortBy, apiUrl, latitude, longitude, radius = 2) => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/portal/product_by_shop_id`, {
                params: {
                    shop_id: shopId,
                    sort_by: sortBy,
                    latitude: latitude,
                    longitude: longitude,
                    radius: radius,
                },
            });

            if (response.data.type === 'service') {
                setShopType('service');
                setShopData({
                    shop_id: response.data.shop_id,
                    shop_name: response.data.shop_name,
                    shop_type: response.data.shop_type
                });
                return;
            }

            if (response.data.status) {
                const products = mergeProductsWithCart(response.data.data);
                const shopName = response.data.data[0]?.shop_name || '';
                setShopProducts(products);
                setSelectedShop(shopName);
                setNoProductsMessage('');
                setShopType('product');

                const cartSummary = await getCartSummary(apiUrl);
                setCartVisible(cartSummary.totalQuantity > 0);
            } else {
                setShopProducts([]);
                setNoProductsMessage('No Products Found');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setShopProducts([]);
            setNoProductsMessage('No Products Found');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (shopId && latitude && longitude) {
            fetchProductsByShopId(shopId, sortBy, apiUrl, latitude, longitude);
        }
    }, [shopId, sortBy, apiUrl, latitude, longitude]);

    const handleAdd = async (id) => {
        try {
            const portal_token = localStorage.getItem('portal_token');
            if (!portal_token) {
                setLoginModalOpen(true);
                return;
            }

            const cartItems = updateLocalCartItems(id, 1);
            setShopProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === id ? { ...product, count: cartItems[id]?.count || 1 } : product
                )
            );

            await addToCart(id, 1);
            window.dispatchEvent(new Event('cartChange'));
            setCartVisible(true);
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const handleIncrease = async (id) => {
        try {
            const cartItems = updateLocalCartItems(id, 1);
            setShopProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === id ? { ...product, count: cartItems[id]?.count || 1 } : product
                )
            );

            const portal_token = localStorage.getItem('portal_token');
            if (portal_token) {
                await addToCart(id, 1);
                window.dispatchEvent(new Event('cartChange'));
            }
            setCartVisible(true);
        } catch (error) {
            console.error('Error increasing quantity:', error);
        }
    };

    const handleDecrease = async (id) => {
        try {
            const cartItems = updateLocalCartItems(id, -1);
            setShopProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === id ? { ...product, count: cartItems[id]?.count || 0 } : product
                )
            );

            const portal_token = localStorage.getItem('portal_token');
            if (portal_token) {
                await addToCart(id, -1);
                window.dispatchEvent(new Event('cartChange'));
            }

            const updatedCartSummary = await getCartSummary(apiUrl);
            setCartVisible(updatedCartSummary.totalQuantity > 0);
        } catch (error) {
            console.error('Error decreasing quantity:', error);
        }
    };

    const handleCardClick = (productId) => {
        navigate(`/product-details/${productId}`);
    };

    const handleGoBack = () => {
        window.history.back();
    };

    if (shopType === 'service') {
        return <ServiceRenderer shopData={shopData} handleGoBack={handleGoBack} />;
    }

    return (
        <Container sx={{ maxWidth: '100%', padding: '0px' }} maxWidth={false}>
            <ThemeProvider theme={Theme}>
                {cartVisible && <CartButton />}

                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <ShopHeader
                            selectedShop={selectedShop}
                            loading={loading}
                            shopProducts={shopProducts}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                        />

                        <ProductGrid
                            loading={loading}
                            shopProducts={shopProducts}
                            shopPertainType={shopPertainType}
                            noProductsMessage={noProductsMessage}
                            handleGoBack={handleGoBack}
                            handleCardClick={handleCardClick}
                            handleAdd={handleAdd}
                            handleIncrease={handleIncrease}
                            handleDecrease={handleDecrease}
                        />
                    </Grid>
                </Grid>
                <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
            </ThemeProvider>
        </Container>
    );
}

export default ShopProductList;
