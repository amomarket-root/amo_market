import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartModalOpen, setCartModalOpen] = useState(false);
    const [cartItemsCount, setCartItemsCount] = useState(0);

    const openCartModal = () => setCartModalOpen(true);
    const closeCartModal = () => setCartModalOpen(false);

    return (
        <CartContext.Provider value={{
            cartModalOpen,
            openCartModal,
            closeCartModal,
            cartItemsCount,
            setCartItemsCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
