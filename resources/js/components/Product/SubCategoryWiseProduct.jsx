import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Container, Grid, List, ListItem, ListItemText, ListItemAvatar, Avatar, Skeleton } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import axios from "axios";
import Theme from '../Theme/Theme';
import { LocationContext } from '../Location/LocationContext';
import LoginModal from '../Auth/LoginModal';
import { addToCart } from '../Cart/cartService';
import CartButton from '../Cart/CartButton';
import {
    getCartItemsFromLocalStorage,
    mergeProductsWithCart,
    updateLocalCartItems,
    getCartSummary
} from '../Cart/cartHelpers';
import CategoryHeader from './CategoryHeader';
import ProductsGrid from './ProductsGrid';
import PageHeader from './PageHeader';
import SortFilter from './SortFilter';

function SubCategoryWiseProduct() {
    const navigate = useNavigate();
    const { categoryId } = useParams();
    const apiUrl = import.meta.env.VITE_API_URL;
    const { latitude, longitude } = useContext(LocationContext);

    // State management
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [productsData, setProductsData] = useState({
        all: [],
        filtered: []
    });
    const [loadingStates, setLoadingStates] = useState({
        initial: true,
        categories: false,
        products: false,
        subcategories: false
    });
    const [uiState, setUiState] = useState({
        sortBy: 'Relevance',
        selectedSubcategory: null,
        selectedCategoryName: '',
        noProductsMessage: ''
    });
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [cartVisible, setCartVisible] = useState(false);

    // Memoized data fetchers
    const fetchCategories = useCallback(async () => {
        try {
            setLoadingStates(prev => ({ ...prev, categories: true }));
            const response = await axios.get(`${apiUrl}/portal/category`, {
                params: { latitude, longitude },
            });
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingStates(prev => ({ ...prev, categories: false }));
        }
    }, [apiUrl, latitude, longitude]);

    const fetchProducts = useCallback(async (categoryId, subcategoryId = null, sortBy = 'Relevance') => {
        setLoadingStates(prev => ({
            ...prev,
            products: true,
            subcategories: true
        }));
        try {
            const response = await axios.get(`${apiUrl}/portal/product_by_group`, {
                params: {
                    category_id: categoryId,
                    subcategory_id: subcategoryId,
                    sort_by: sortBy,
                    latitude,
                    longitude,
                    radius: 2,
                }
            });

            if (response.data.status) {
                const data = response.data.data;
                const categoryName = data[0]?.name || '';
                const allProducts = data.flatMap(item =>
                    item.sub_category.flatMap(sub => sub.product)
                );
                const subCategories = data.flatMap(item => item.sub_category)
                    .sort((a, b) => a.name.localeCompare(b.name));

                // Set first subcategory as default if none selected
                const selectedSubId = subcategoryId || (subCategories[0]?.id || null);

                setSubcategories(subCategories);
                setUiState(prev => ({
                    ...prev,
                    selectedCategoryName: categoryName,
                    selectedSubcategory: selectedSubId,
                    noProductsMessage: ''
                }));

                // Merge products with cart items from localStorage
                const mergedProducts = mergeProductsWithCart(allProducts);

                // Filter products immediately
                const filteredProducts = selectedSubId ?
                    mergedProducts.filter(p => p.sub_category_id === selectedSubId) :
                    mergedProducts;

                setProductsData({
                    all: mergedProducts,
                    filtered: filteredProducts
                });

                // Check if cart should be visible
                const cartSummary = await getCartSummary(apiUrl);
                setCartVisible(cartSummary.totalQuantity > 0);
            } else {
                setProductsData({ all: [], filtered: [] });
                setUiState(prev => ({ ...prev, noProductsMessage: 'No Products Found' }));
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProductsData({ all: [], filtered: [] });
            setUiState(prev => ({ ...prev, noProductsMessage: 'No Products Found' }));
        } finally {
            setLoadingStates(prev => ({
                ...prev,
                products: false,
                initial: false,
                subcategories: false
            }));
        }
    }, [apiUrl, latitude, longitude]);

    // Initial data load - optimized with parallel loading
    useEffect(() => {
        let isMounted = true;

        const loadInitialData = async () => {
            try {
                // Load categories and products in parallel
                await Promise.all([
                    fetchCategories(),
                    categoryId && fetchProducts(categoryId)
                ]);
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        };

        if (isMounted) {
            loadInitialData();
        }

        return () => {
            isMounted = false;
        };
    }, [categoryId, fetchCategories, fetchProducts]);

    // Handle category change
    const handleCategoryClick = useCallback((clickedCategoryId) => {
        if (categoryId !== clickedCategoryId) {
            // Reset states before loading new category
            setLoadingStates(prev => ({ ...prev, subcategories: true }));
            setSubcategories([]);
            setProductsData({ all: [], filtered: [] });
            navigate(`/all_product/subcategory/${clickedCategoryId}`);
        }
    }, [categoryId, navigate]);

    // Optimize subcategory selection
    const handleSubcategoryClick = useCallback((subcategoryId) => {
        setUiState(prev => ({ ...prev, selectedSubcategory: subcategoryId }));

        // Filter from already loaded products
        const filtered = productsData.all.filter(p => p.sub_category_id === subcategoryId);
        setProductsData(prev => ({ ...prev, filtered }));
    }, [productsData.all]);

    // Memoize handlers to prevent unnecessary re-renders
    const handleSortChange = useCallback(async (e) => {
        const newSortBy = e.target.value;
        setUiState(prev => ({ ...prev, sortBy: newSortBy }));
        await fetchProducts(categoryId, uiState.selectedSubcategory, newSortBy);
    }, [categoryId, fetchProducts, uiState.selectedSubcategory]);

    const handleAdd = useCallback(async (id) => {
        try {
            const portal_token = localStorage.getItem('portal_token');
            if (!portal_token) {
                setLoginModalOpen(true);
                return;
            }

            // Update localStorage
            const cartItems = updateLocalCartItems(id, 1);

            // Update local state
            setProductsData(prev => ({
                all: prev.all.map(p =>
                    p.id === id ? { ...p, count: cartItems[id]?.count || 1 } : p
                ),
                filtered: prev.filtered.map(p =>
                    p.id === id ? { ...p, count: cartItems[id]?.count || 1 } : p
                )
            }));

            await addToCart(id, 1);
            window.dispatchEvent(new Event('cartChange'));
            setCartVisible(true);
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    }, []);

    const handleIncrease = useCallback(async (id) => {
        try {
            // Update localStorage
            const cartItems = updateLocalCartItems(id, 1);

            // Update local state
            setProductsData(prev => ({
                all: prev.all.map(p =>
                    p.id === id ? { ...p, count: cartItems[id]?.count || 1 } : p
                ),
                filtered: prev.filtered.map(p =>
                    p.id === id ? { ...p, count: cartItems[id]?.count || 1 } : p
                )
            }));

            const portal_token = localStorage.getItem('portal_token');
            if (portal_token) {
                await addToCart(id, 1);
                window.dispatchEvent(new Event('cartChange'));
            }
            setCartVisible(true);
        } catch (error) {
            console.error('Error increasing quantity:', error);
        }
    }, []);

    const handleDecrease = useCallback(async (id) => {
        try {
            // Update localStorage
            const cartItems = updateLocalCartItems(id, -1);

            // Update local state
            setProductsData(prev => ({
                all: prev.all.map(p =>
                    p.id === id ? { ...p, count: cartItems[id]?.count || 0 } : p
                ),
                filtered: prev.filtered.map(p =>
                    p.id === id ? { ...p, count: cartItems[id]?.count || 0 } : p
                )
            }));

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
    }, [apiUrl]);

    const handleCardClick = useCallback((productId) => {
        navigate(`/product-details/${productId}`);
    }, [navigate]);

    // Memoize derived values
    const selectedSubcategoryObj = useMemo(() =>
        subcategories.find(sub => sub.id === uiState.selectedSubcategory),
        [subcategories, uiState.selectedSubcategory]
    );

    const subcategoryName = useMemo(() =>
        selectedSubcategoryObj?.name || '',
        [selectedSubcategoryObj]
    );

    const showSubcategoryLoading = useMemo(() =>
        loadingStates.initial || loadingStates.subcategories,
        [loadingStates.initial, loadingStates.subcategories]
    );

    const showProductLoading = useMemo(() =>
        loadingStates.initial || loadingStates.products,
        [loadingStates.initial, loadingStates.products]
    );

    return (
        <Container sx={{ maxWidth: '100%', padding: '0px' }} maxWidth={false}>
            <ThemeProvider theme={Theme}>
                {cartVisible && <CartButton />}

                <CategoryHeader
                    categories={categories}
                    loading={loadingStates.initial}
                    onCategoryClick={handleCategoryClick}
                />

                <Grid container spacing={1}>
                    <Grid item xs={2}>
                        <List>
                            {showSubcategoryLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <ListItem key={index} sx={listItemSx}>
                                        <ListItemAvatar>
                                            <Skeleton variant="rectangular" width={60} height={60} sx={avatarSx} />
                                        </ListItemAvatar>
                                        <ListItemText primary={<Skeleton variant="text" width={70} height={20} />} />
                                        <ListItemText primary={<Skeleton variant="text" width={20} height={20} />} />
                                    </ListItem>
                                ))
                            ) : (
                                subcategories.map((subcategory) => (
                                    <ListItem
                                        key={subcategory.id}
                                        button
                                        selected={uiState.selectedSubcategory === subcategory.id}
                                        onClick={() => handleSubcategoryClick(subcategory.id)}
                                        sx={listItemSx}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                src={subcategory.image}
                                                variant="square"
                                                sx={avatarSx}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={subcategory.name}
                                            sx={{ textAlign: "center" }}
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Grid>
                    <Grid item xs={10}>
                        <PageHeader
                            title={subcategoryName ? `Buy ${subcategoryName} Online` : ''}
                            loading={showSubcategoryLoading}
                        >
                            {/* Only show SortFilter if products are available */}
                            {productsData.filtered.length > 0 && (
                                <SortFilter
                                    sortBy={uiState.sortBy}
                                    loading={showProductLoading}
                                    onSortChange={handleSortChange}
                                />
                            )}
                        </PageHeader>

                        <ProductsGrid
                            products={productsData.filtered}
                            loading={showProductLoading}
                            noProductsMessage={uiState.noProductsMessage}
                            onCardClick={handleCardClick}
                            onAdd={handleAdd}
                            onIncrease={handleIncrease}
                            onDecrease={handleDecrease}
                            columns={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} // 5 products per row (12/5=2.4)
                        />
                    </Grid>
                </Grid>

                <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
            </ThemeProvider>
        </Container>
    );
}

// Style constants
const listItemSx = {
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: 2,
};

const avatarSx = {
    width: 60,
    height: 60,
    marginBottom: { xs: 1, sm: 0 },
    borderRadius: 2,
};

export default SubCategoryWiseProduct;
