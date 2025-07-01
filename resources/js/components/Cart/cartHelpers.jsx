// src/Cart/cartHelpers.jsx

// Get cart items from localStorage
export const getCartItemsFromLocalStorage = () => {
    const cartItems = localStorage.getItem('cartItems');
    return cartItems ? JSON.parse(cartItems) : {};
};

// Save cart items to localStorage
export const saveCartItemsToLocalStorage = (cartItems) => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
};

// Update cart items in localStorage
export const updateLocalCartItems = (id, countChange) => {
    const cartItems = getCartItemsFromLocalStorage();
    const newCount = (cartItems[id]?.count || 0) + countChange;

    if (newCount <= 0) {
        delete cartItems[id];
    } else {
        cartItems[id] = { id, count: newCount };
    }

    saveCartItemsToLocalStorage(cartItems);
    return cartItems;
};

// Merge products with cart items from localStorage
export const mergeProductsWithCart = (products) => {
    const cartItems = getCartItemsFromLocalStorage();

    if (Array.isArray(products)) {
        return products.map(product => {
            const cartItem = cartItems[product.id];
            return cartItem ? { ...product, count: cartItem.count } : product;
        });
    } else if (typeof products === 'object' && products !== null) {
        return Object.keys(products).reduce((acc, category) => {
            acc[category] = products[category].map(product => {
                const cartItem = cartItems[product.id];
                return cartItem ? { ...product, count: cartItem.count } : product;
            });
            return acc;
        }, {});
    }
    return products;
};

// Get cart summary (total quantity)
export const getCartSummary = async (apiUrl) => {
    const portal_token = localStorage.getItem('portal_token');
    if (!portal_token) {
        const cartItems = getCartItemsFromLocalStorage();
        const totalQuantity = Object.values(cartItems).reduce((sum, item) => sum + item.count, 0);
        return { totalQuantity, totalAmount: 0 };
    }
    try {
        const response = await axios.get(`${apiUrl}/portal/cart/summary`, {
            headers: {
                Authorization: `Bearer ${portal_token}`
            }
        });
        if (response.data.status) {
            return response.data.data;
        } else {
            console.error('Failed to fetch cart summary:', response.data.message);
            return { totalQuantity: 0, totalAmount: 0 };
        }
    } catch (error) {
        console.error('Error fetching cart summary:', error);
        return { totalQuantity: 0, totalAmount: 0 };
    }
};
