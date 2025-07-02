import React, { useState } from "react";
import {
    Dialog,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Slide,
    Box,
    Paper,
    Tooltip,
    Avatar,
    Grid,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WalletIcon from "@mui/icons-material/Wallet";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useSweetAlert } from "../Theme/SweetAlert";
import CashfreePaymentUI from "./CashfreePaymentUI";

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
    const [selectedSection, setSelectedSection] = useState(null);

    const onlineMethods = [
        { title: "Cards", description: "Add credit and debit cards", icon: <CreditCardIcon /> },
        { title: "Netbanking", description: "Pay via your bank", icon: <AccountBalanceIcon /> },
        { title: "UPI", description: "Pay using any UPI app", icon: <PaymentIcon /> },
        { title: "Wallet", description: "Use your wallet balance", icon: <WalletIcon /> },
        { title: "PhonePe", description: "Pay via PhonePe", icon: <PaymentIcon /> },
        { title: "Google Pay", description: "Pay via GPay", icon: <PaymentIcon /> },
        { title: "Cred", description: "Pay using Cred", icon: <PaymentIcon /> },
        { title: "Paytm", description: "Pay using Paytm", icon: <WalletIcon /> },
        { title: "More", description: "More payment options coming soon", icon: <MoreHorizIcon /> },
    ];

    const offlineMethods = [
        { title: "Cash on Delivery",
            description: "Cash at your door",
            icon: <LocalShippingIcon />,
            isComingSoon: true,
        },
        {
            title: "UPI/BHIM on Delivery",
            description: "Scan and pay at delivery",
            icon: <PaymentIcon />,
            isComingSoon: true,
        },
    ];

    const handlePaymentMethodClick = (method) => {
        const onlineTitles = onlineMethods.map((m) => m.title);

        if (onlineTitles.includes(method.title) && !method.isComingSoon) {
            setSelectedMethod(method.title);
            setSelectedSection("online");
            setShowCashfree(true);
        } else if (method.isComingSoon) {
            showAlert({
                icon: "info",
                title: "Coming Soon",
                text: "This payment method will be available soon!",
            });
        } else {
            setSelectedSection("offline");
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
        setSelectedSection(null);
        onClose();
    };

    const renderMethodGrid = (methods) => (
        <Grid container spacing={2}>
            {methods.map((method, index) => (
                <Grid item xs={4} sm={3} md={3} lg={3} key={index} sx={{ textAlign: "center" }}>
                    <Tooltip title={method.description} arrow placement="top">
                        <Box
                            sx={{
                                cursor: method.isComingSoon ? "not-allowed" : "pointer",
                                opacity: method.isComingSoon ? 0.7 : 1,
                                "&:hover .avatar": {
                                    transform: method.isComingSoon ? "none" : "scale(1.1)",
                                },
                            }}
                            onClick={() => handlePaymentMethodClick(method)}
                        >
                            <Avatar
                                className="avatar"
                                sx={{
                                    bgcolor: method.isComingSoon
                                        ? "grey.300"
                                        : "primary.main",
                                    color: "#fff",
                                    width: 60,
                                    height: 60,
                                    mx: "auto",
                                    transition: "transform 0.2s",
                                }}
                            >
                                {method.icon}
                            </Avatar>
                            <Typography
                                variant="body2"
                                sx={{ mt: 1, fontWeight: 500 }}
                            >
                                {method.title}
                            </Typography>
                            {method.isComingSoon && (
                                <Typography
                                    variant="caption"
                                    sx={{ color: "error.main", fontWeight: "bold" }}
                                >
                                    Coming Soon
                                </Typography>
                            )}
                        </Box>
                    </Tooltip>
                </Grid>
            ))}
        </Grid>
    );

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
                        zIndex: 10,
                    }}
                >
                    <Toolbar>
                        <IconButton edge="start" onClick={handleClose} aria-label="back">
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography
                            sx={{ ml: 2, flex: 1, color: "black", fontWeight: "bold" }}
                            variant="h6"
                        >
                            {showCashfree ? "Cashfree Payment" : "Select Payment Method"}
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Box
                    sx={{
                        mt: 2,
                        px: 2,
                        pb: 2,
                        overflowY: "auto",
                        flexGrow: 1,
                        backgroundColor: "#f7f7f7",
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
                        <>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    mb: 2,
                                    border: selectedSection === "online" ? `2px solid ${theme.palette.primary.main}` : "none"
                                }}
                                onClick={() => setSelectedSection("online")}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "bold", mb: 2 }}
                                >
                                    Online Payments
                                </Typography>
                                {renderMethodGrid(onlineMethods)}
                            </Paper>

                            <Paper
                                elevation={3}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: selectedSection === "offline" ? `2px solid ${theme.palette.primary.main}` : "none"
                                }}
                                onClick={() => setSelectedSection("offline")}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "bold", mb: 2 }}
                                >
                                    Offline Payments
                                </Typography>
                                {renderMethodGrid(offlineMethods)}
                            </Paper>
                        </>
                    )}
                </Box>
            </Box>
        </Dialog>
    );
};

export default PaymentMethodsModel;
