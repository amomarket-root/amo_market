// OrderButtonLayout.js
import React from 'react';
import OrderButton from './OrderButton';
import OrderModel from './OrderModel';

const OrderButtonLayout = ({ children }) => {
  return (
    <div>
      {children}
      <OrderButton />
      <OrderModel />
    </div>
  );
};

export default OrderButtonLayout;
