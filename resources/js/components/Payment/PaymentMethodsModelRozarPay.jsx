import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import useMediaQuery from "@mui/material/useMediaQuery";
import Slide from "@mui/material/Slide";
import { useTheme } from "@mui/material/styles";
import { Box, AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentMethodsList from "./PaymentMethodsList";
import RazorpayPaymentUI from "./RazorpayPaymentUI";
import WalletIcon from "@mui/icons-material/Wallet";
import { useOrderContext } from "../Order/OrderContext";
import { useSweetAlert } from '../Theme/SweetAlert';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
});

const PaymentMethodsModel = ({ open, onClose, onPaymentSuccess }) => {
    const theme = useTheme();
     const showAlert = useSweetAlert();
    const apiUrl = import.meta.env.VITE_API_URL;
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [showRazorpay, setShowRazorpay] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const { openOrderModel } = useOrderContext();

    const paymentMethods = [
        {
            title: "Cards",
            description: "Add credit and debit cards",
            icon: <CreditCardIcon />,
        },
        {
            title: "Netbanking",
            description: "Select Bank",
            icon: <AccountBalanceIcon />,
        },
        {
            title: "Wallet",
            description: "Pay Through Wallet",
            icon: <WalletIcon />,
        },
        {
            title: "UPI",
            description: "UPI payment is in test mode, not available now.",
            icon: <PaymentIcon />,
            isComingSoon: true,
        },
        {
            title: "Pay on delivery",
            description: "Pay cash at the time of delivery",
            icon: <LocalShippingIcon />,
            isComingSoon: true,
        },
    ];

    const handlePaymentMethodClick = (method) => {
        if (
            method.title === "Cards" ||
            method.title === "Netbanking" ||
            method.title === "Wallet" ||
            method.title === "UPI"
        ) {
            setSelectedMethod(method.title);
            setShowRazorpay(true);
        } else {
            showAlert({
                icon: "info",
                title: "Not Supported",
                text: "This payment method is not supported yet.",
            });
        }
    };

    const handleOrderCreated = (orderId) => {
        openOrderModel(orderId);
        onPaymentSuccess();
        onClose();
    };

    return (
        <Dialog
            fullScreen={isMobile}
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            keepMounted
            sx={
                !isMobile
                    ? {
                        "& .MuiDialog-paper": {
                            position: "fixed",
                            right: 0,
                            margin: 0,
                            width: "30%",
                            height: "100vh",
                            maxHeight: "100vh",
                        },
                    }
                    : {}
            }
        >
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <AppBar
                    sx={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#fff",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                        color: "transparent",
                        borderBottomLeftRadius: "10px",
                        borderBottomRightRadius: "10px",
                        zIndex: 10,
                    }}
                >
                    <Toolbar>
                        <IconButton edge="start" onClick={onClose} aria-label="back">
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography
                            sx={{
                                ml: 2,
                                flex: 1,
                                color: "black",
                                fontWeight: "bold",
                            }}
                            variant="h6"
                        >
                            {showRazorpay ? "Payment Gateway" : "Select Payment Method"}
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Box
                    sx={{
                        mt: 2,
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        padding: "16px",
                        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    {showRazorpay ? (
                        <RazorpayPaymentUI
                            selectedMethod={selectedMethod}
                            onClose={onClose}
                            apiUrl={apiUrl}
                            onOrderCreated={handleOrderCreated}
                        />
                    ) : (
                        <PaymentMethodsList
                            paymentMethods={paymentMethods}
                            onMethodClick={handlePaymentMethodClick}
                        />
                    )}
                </Box>
            </Box>
        </Dialog>
    );
};

export default PaymentMethodsModel;
