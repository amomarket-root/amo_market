import React from "react";
import PaymentMethodCard from "./PaymentMethodCard";

const PaymentMethodsList = ({ paymentMethods, onMethodClick }) => {
  return (
    <>
      {paymentMethods.map((method, index) => (
        <PaymentMethodCard
          key={index}
          method={method}
          onClick={() => onMethodClick(method)}
          isComingSoon={method.isComingSoon} // Pass the coming soon flag
        />
      ))}
    </>
  );
};

export default PaymentMethodsList;
