import React, { useRef, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { LocationContext } from '../Location/LocationContext';
import { useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ProductCategorySection from './ProductCategorySection';
import LoadingSkeleton from './LoadingSkeleton';
import CartButton from '../Cart/CartButton';
import LoginModal from '../Auth/LoginModal';
import { addToCart } from '../Cart/cartService';
import {
    getCartItemsFromLocalStorage,
    mergeProductsWithCart,
    updateLocalCartItems,
    getCartSummary
} from '../Cart/cartHelpers';
import { useCart } from '../Cart/CartContext';

const fetchProducts = async ({ queryKey }) => {
    const [_key, { latitude, longitude, apiUrl }] = queryKey;
    if (!latitude || !longitude) {
        throw new Error('Latitude and Longitude not available');
    }
    const response = await axios.get(`${apiUrl}/portal/products`, {
        params: { latitude, longitude, radius: 2 },
    });
    if (!response.data.status) {
        throw new Error(response.data.message);
    }
    return response.data.data || {};
};

const Products = () => {
    const theme = useTheme();
    const { latitude, longitude } = useContext(LocationContext);
    const { setCartSummary } = useCart();
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [localProducts, setLocalProducts] = useState({});
    const [scrollPosition, setScrollPosition] = useState({});
    const [cartVisible, setCartVisible] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const scrollRefs = useRef({});

    const { data: products = {}, isLoading, isError, error } = useQuery({
        queryKey: ['products', { latitude, longitude, apiUrl }],
        queryFn: fetchProducts,
        enabled: !!latitude && !!longitude,
        staleTime: 20 * 60 * 1000,
        keepPreviousData: false,
        retry: false,
    });

    const memoizedProducts = useMemo(() => products, [JSON.stringify(products)]);

    useEffect(() => {
        if (isError) {
            setLocalProducts({});
        } else if (Object.keys(memoizedProducts).length > 0) {
            const mergedProducts = mergeProductsWithCart(memoizedProducts);
            const initialScrollPositions = Object.keys(memoizedProducts).reduce((acc, category) => {
                acc[category] = 0;
                return acc;
            }, {});

            setScrollPosition(initialScrollPositions);
            setLocalProducts(mergedProducts);
        }
    }, [memoizedProducts, isError]);

    const handleScroll = (categoryName, direction) => {
        const scrollContainer = scrollRefs.current[categoryName];
        const scrollAmount = 200;
        const newScrollPosition = direction === 'left'
            ? scrollPosition[categoryName] - scrollAmount
            : scrollPosition[categoryName] + scrollAmount;

        scrollContainer.scrollTo({
            left: newScrollPosition,
            behavior: 'smooth',
        });

        setScrollPosition(prev => ({
            ...prev,
            [categoryName]: newScrollPosition,
        }));
    };

    const handleCardClick = (productId) => {
        navigate(`/product-details/${productId}`);
    };

    const updateCartSummary = async () => {
        const summary = await getCartSummary(apiUrl);
        setCartSummary(summary);
        setCartVisible(summary.totalQuantity > 0);
    };

    const handleAdd = async (id) => {
        try {
            const portal_token = localStorage.getItem('portal_token');
            if (!portal_token) {
                setLoginModalOpen(true);
                return;
            }

            // Update localStorage
            const cartItems = updateLocalCartItems(id, 1);

            // Update local state
            setLocalProducts(prevProducts => {
                const updatedProducts = { ...prevProducts };
                Object.keys(updatedProducts).forEach(category => {
                    updatedProducts[category] = updatedProducts[category].map(product =>
                        product.id === id ? { ...product, count: cartItems[id]?.count || 1 } : product
                    );
                });
                return updatedProducts;
            });

            await addToCart(id, 1);
            window.dispatchEvent(new CustomEvent('cartChange'));
            await updateCartSummary();
            setCartVisible(true);
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const handleIncrease = async (id) => {
        try {
            // Update localStorage
            const cartItems = updateLocalCartItems(id, 1);

            // Update local state
            setLocalProducts(prevProducts => {
                const updatedProducts = { ...prevProducts };
                Object.keys(updatedProducts).forEach(category => {
                    updatedProducts[category] = updatedProducts[category].map(product =>
                        product.id === id ? { ...product, count: cartItems[id]?.count || 1 } : product
                    );
                });
                return updatedProducts;
            });

            const portal_token = localStorage.getItem('portal_token');
            if (portal_token) {
                await addToCart(id, 1);
                window.dispatchEvent(new CustomEvent('cartChange'));
                await updateCartSummary();
            }
            setCartVisible(true);
        } catch (error) {
            console.error('Error increasing quantity:', error);
        }
    };

    const handleDecrease = async (id) => {
        try {
            // Update localStorage
            const cartItems = updateLocalCartItems(id, -1);

            // Update local state
            setLocalProducts(prevProducts => {
                const updatedProducts = { ...prevProducts };
                Object.keys(updatedProducts).forEach(category => {
                    updatedProducts[category] = updatedProducts[category].map(product =>
                        product.id === id ? { ...product, count: cartItems[id]?.count || 0 } : product
                    );
                });
                return updatedProducts;
            });

            const portal_token = localStorage.getItem('portal_token');
            if (portal_token) {
                await addToCart(id, -1);
                window.dispatchEvent(new CustomEvent('cartChange'));
                await updateCartSummary();
            }

            const updatedCartSummary = await getCartSummary(apiUrl);
            if (updatedCartSummary.totalQuantity === 0) {
                setCartVisible(false);
            }
        } catch (error) {
            console.error('Error decreasing quantity:', error);
        }
    };

    return (
        <Container sx={{
            marginTop: '30px',
            marginBottom: '5px',
            maxWidth: '100%',
            padding: '0px',
            '& .MuiCard-root': {
                margin: '8px 4px' // Ensures consistent spacing between cards
            }
        }} maxWidth={false}>
            {cartVisible && <CartButton />}

            {isLoading ? (
                Array.from(new Array(3)).map((_, index) => (
                    <LoadingSkeleton key={index} />
                ))
            ) : isError ? (
                <LoadingSkeleton />
            ) : localProducts && Object.keys(localProducts).length > 0 ? (
                Object.keys(localProducts).map(categoryName => (
                    <ProductCategorySection
                        key={categoryName}
                        categoryName={categoryName}
                        products={localProducts[categoryName]}
                        scrollPosition={scrollPosition[categoryName]}
                        scrollRef={el => (scrollRefs.current[categoryName] = el)}
                        theme={theme}
                        handleScroll={(direction) => handleScroll(categoryName, direction)}
                        handleCardClick={handleCardClick}
                        handleAdd={handleAdd}
                        handleIncrease={handleIncrease}
                        handleDecrease={handleDecrease}
                    />
                ))
            ) : (
                <LoadingSkeleton />
            )}

            <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
        </Container>
    );
};

export default Products;
