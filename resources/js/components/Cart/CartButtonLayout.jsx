import React from 'react';
import CartButton from './CartButton';
import CartModel from './CartModel';

const CartButtonLayout = ({ children }) => {
  return (
    <>
      <CartButton />
      {children}
      <CartModel />
    </>
  );
};

export default CartButtonLayout;
