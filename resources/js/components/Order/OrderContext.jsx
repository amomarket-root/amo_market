import React, { createContext, useState, useContext, useRef } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [isOrderModelOpen, setIsOrderModelOpen] = useState(false);
  const [orderButtonVisible, setOrderButtonVisible] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const lastOpenedOrderId = useRef(null); // Track last opened order

  const openOrderModel = (orderId) => {
    // Prevent reopening the same order
    if (lastOpenedOrderId.current === orderId) return;

    lastOpenedOrderId.current = orderId;
    setSelectedOrderId(orderId);
    setIsOrderModelOpen(true);
    setOrderButtonVisible(false);
  };

  const closeOrderModel = () => {
    setIsOrderModelOpen(false);
    setOrderButtonVisible(true);
    setSelectedOrderId(null);
    lastOpenedOrderId.current = null;
    window.dispatchEvent(new Event('orderChange'));
  };

  return (
    <OrderContext.Provider
      value={{
        isOrderModelOpen,
        orderButtonVisible,
        selectedOrderId,
        openOrderModel,
        closeOrderModel,
        setOrderButtonVisible
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => useContext(OrderContext);
