import React, { createContext, useState, useContext } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [isOrderModelOpen, setIsOrderModelOpen] = useState(false);
  const [orderButtonVisible, setOrderButtonVisible] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const openOrderModel = (orderId) => {
    setSelectedOrderId(orderId);
    setIsOrderModelOpen(true);
    setOrderButtonVisible(false);
  };

  const closeOrderModel = () => {
    setIsOrderModelOpen(false);
    setOrderButtonVisible(true);
    setSelectedOrderId(null);
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
