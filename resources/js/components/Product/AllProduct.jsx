import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Container } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import axios from "axios";
import Theme from '../Theme/Theme';
import { LocationContext } from '../Location/LocationContext';
import LoginModal from '../Auth/LoginModal';
import { addToCart } from '../Cart/cartService';
import {
    mergeProductsWithCart,
    updateLocalCartItems,
    getCartSummary
} from '../Cart/cartHelpers';
import CategoryHeader from './CategoryHeader';
import ProductsGrid from './ProductsGrid';
import PageHeader from './PageHeader';
import SortFilter from './SortFilter';

function AllProduct() {
    const navigate = useNavigate();
    const { categoryId } = useParams();
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const { latitude, longitude } = useContext(LocationContext);
    const apiUrl = import.meta.env.VITE_API_URL;
    const [categories, setCategories] = useState([]);
    const [sortBy, setSortBy] = useState('Relevance');
    const [subcategoryProducts, setSubcategoryProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [noProductsMessage, setNoProductsMessage] = useState('');
    const [locationLoaded, setLocationLoaded] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const fetchCategory = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${apiUrl}/portal/category`, {
                    params: { latitude, longitude },
                });
                setCategories(response.data.data);
            } catch (error) {
                console.error('Error fetching category:', error);
            } finally {
                setLoading(false);
            }
        };

        if (latitude && longitude) {
            fetchCategory();
            setLocationLoaded(true);
        }
    }, [latitude, longitude, apiUrl]);

    const fetchProductsByCategoryId = async (categoryId, sortBy, apiUrl, latitude, longitude, radius = 2) => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/portal/product_by_id`, {
                params: {
                    category_id: categoryId,
                    sort_by: sortBy,
                    latitude: latitude,
                    longitude: longitude,
                    radius: radius,
                },
            });

            if (response.data.status) {
                const products = response.data.data;
                const categoryName = response.data.data[0]?.sub_category?.category?.name || '';
                const mergedProducts = mergeProductsWithCart(products);
                setSubcategoryProducts(mergedProducts);
                setSelectedCategory(categoryName);
                setNoProductsMessage('');
            } else {
                setSubcategoryProducts([]);
                setNoProductsMessage('No Products Found');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setSubcategoryProducts([]);
            setNoProductsMessage('No Products Found');
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    useEffect(() => {
        if (categoryId && latitude && longitude && locationLoaded) {
            fetchProductsByCategoryId(categoryId, sortBy, apiUrl, latitude, longitude);
        }
    }, [categoryId, sortBy, apiUrl, latitude, longitude, locationLoaded]);

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
            setSubcategoryProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === id ? { ...product, count: cartItems[id]?.count || 1 } : product
                )
            );

            await addToCart(id, 1);
            window.dispatchEvent(new Event('cartChange'));
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const handleIncrease = async (id) => {
        try {
            // Update localStorage
            const cartItems = updateLocalCartItems(id, 1);

            // Update local state
            setSubcategoryProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === id ? { ...product, count: cartItems[id]?.count || 1 } : product
                )
            );

            const portal_token = localStorage.getItem('portal_token');
            if (portal_token) {
                await addToCart(id, 1);
                window.dispatchEvent(new Event('cartChange'));
            }
        } catch (error) {
            console.error('Error increasing quantity:', error);
        }
    };

    const handleDecrease = async (id) => {
        try {
            // Update localStorage
            const cartItems = updateLocalCartItems(id, -1);

            // Update local state
            setSubcategoryProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === id ? { ...product, count: cartItems[id]?.count || 0 } : product
                )
            );

            const portal_token = localStorage.getItem('portal_token');
            if (portal_token) {
                await addToCart(id, -1);
                window.dispatchEvent(new Event('cartChange'));
            }
        } catch (error) {
            console.error('Error decreasing quantity:', error);
        }
    };

    const handleCardClick = (productId) => {
        navigate(`/product-details/${productId}`);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const handleCategoryClick = (categoryId) => {
        navigate(`/all_product/subcategory/${categoryId}`);
    };

    return (
        <Container sx={{ maxWidth: '100%', padding: '0px' }} maxWidth={false}>
            <ThemeProvider theme={Theme}>
                <CategoryHeader
                    categories={categories}
                    loading={loading}
                    onCategoryClick={handleCategoryClick}
                />

                <PageHeader
                    title={selectedCategory ? `Buy ${selectedCategory} Online` : ''}
                    loading={loading}
                >
                    {/* Only show SortFilter if products are available */}
                    {subcategoryProducts.length > 0 && (
                        <SortFilter
                            sortBy={sortBy}
                            loading={loading}
                            onSortChange={handleSortChange}
                        />
                    )}
                </PageHeader>

                <ProductsGrid
                    products={subcategoryProducts}
                    loading={loading}
                    initialLoad={initialLoad}
                    noProductsMessage={noProductsMessage}
                    onCardClick={handleCardClick}
                    onAdd={handleAdd}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                />
            </ThemeProvider>
            <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
        </Container>
    );
}

export default AllProduct;
