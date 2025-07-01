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
import CashfreePaymentUI from "./CashfreePaymentUI";
import WalletIcon from "@mui/icons-material/Wallet";
import { useSweetAlert } from '../Theme/SweetAlert';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
});

const PaymentMethodsModel = ({ open, onClose, onPaymentSuccess }) => {
    const theme = useTheme();
    const showAlert = useSweetAlert();
    const apiUrl = import.meta.env.VITE_API_URL;
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [showCashfree, setShowCashfree] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);

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
            title: "UPI",
            description: "UPI payment via Cashfree",
            icon: <PaymentIcon />,
        },
        {
            title: "Wallet",
            description: "Pay Through Wallet",
            icon: <WalletIcon />,
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
            method.title === "UPI" ||
            method.title === "Wallet"
        ) {
            setSelectedMethod(method.title);
            setShowCashfree(true);
        } else {
            showAlert({
                icon: "info",
                title: "Not Supported",
                text: "This payment method is not supported yet.",
            });
        }
    };

    const handleClose = () => {
        setShowCashfree(false);
        setSelectedMethod(null);
        onClose();
    };

    return (
        <Dialog
            fullScreen={isMobile}
            open={open}
            onClose={handleClose}
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
                        <IconButton edge="start" onClick={handleClose} aria-label="back">
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
                            {showCashfree ? "Cashfree Payment" : "Select Payment Method"}
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
                    {showCashfree ? (
                        <CashfreePaymentUI
                            selectedMethod={selectedMethod}
                            onClose={handleClose}
                            apiUrl={apiUrl}
                            onPaymentSuccess={onPaymentSuccess}
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
