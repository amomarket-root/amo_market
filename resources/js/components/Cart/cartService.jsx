import axios from 'axios';

export const addToCart = async (itemId, quantity, itemType = 'product') => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const portal_token = localStorage.getItem('portal_token');
    if (!portal_token) {
        console.log('User is not authenticated');
        return;
    }

    try {
        const payload = itemType === 'product'
            ? { product_id: itemId, quantity }
            : { service_id: itemId, quantity };

        const response = await axios.post(
            `${apiUrl}/portal/cart/add`,
            payload,
            { headers: { Authorization: `Bearer ${portal_token}` } }
        );
        console.log('Item added to cart', response.data);

        return response.data;
    } catch (err) {
        console.error('Error adding item to cart:', err);
        throw err;
    }
};
