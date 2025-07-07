import React, { useState } from "react";
import { Dialog, AppBar, Toolbar, IconButton, Typography, Slide, Box, Paper, Tooltip, Avatar, Grid, useMediaQuery, } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
        { title: "Cards", description: "Add credit and debit cards", image: "/image/payment/cards.webp" },
        { title: "Netbanking", description: "Pay via your bank", image: "/image/payment/netbanking.webp" },
        { title: "UPI", description: "Pay using any UPI app", image: "/image/payment/upi.webp" },
        { title: "Wallet", description: "Use your wallet balance", image: "/image/payment/wallet.webp" },
        { title: "PhonePe", description: "Pay via PhonePe", image: "/image/payment/phonepe.webp" },
        { title: "Google Pay", description: "Pay via GPay", image: "/image/payment/googlepay.webp" },
        { title: "Cred", description: "Pay using Cred", image: "/image/payment/cred.webp" },
        { title: "Paytm", description: "Pay using Paytm", image: "/image/payment/paytm.webp" },
        { title: "More", description: "More payment options coming soon", image: "/image/payment/more.webp" },
    ];

    const offlineMethods = [
        { title: "Cash on Delivery", description: "Cash at your door", image: "/image/payment/cash_on_delivery.webp", isComingSoon: true },
        { title: "UPI/BHIM on Delivery", description: "Scan and pay at delivery", image: "/image/payment/bhim_upi.webp", isComingSoon: true },
        { title: "Amo Market pay Later", description: "Pay later option", image: "/image/payment/amo_market_pay_later.webp", isComingSoon: true },
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
                <Grid item xs={4} key={index}>
                    <Tooltip title={method.description} arrow placement="top">
                        <Box
                            sx={{
                                cursor: method.isComingSoon ? "not-allowed" : "pointer",
                                opacity: method.isComingSoon ? 0.6 : 1,
                                textAlign: "center",
                                transition: "all 0.3s ease",
                                "&:hover .avatar": {
                                    transform: method.isComingSoon ? "none" : "scale(1.1)",
                                },
                            }}
                            onClick={() => handlePaymentMethodClick(method)}
                        >
                            <Avatar
                                className="avatar"
                                src={method.image}
                                alt={method.title}
                                sx={{
                                    bgcolor: "white",
                                    width: 70,
                                    height: 70,
                                    mx: "auto",
                                    boxShadow: 3,
                                    transition: "transform 0.2s",
                                    '& img': {
                                        objectFit: 'contain',
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%'
                                    }
                                }}
                            />
                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
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
            sx={!isMobile ? {
                "& .MuiDialog-paper": {
                    position: "fixed",
                    right: 0,
                    margin: 0,
                    width: "38%",
                    height: "100vh",
                    maxHeight: "100vh",
                },
            } : {}}
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
                                    mt: 1,
                                    border: selectedSection === "online" ? `2px solid ${theme.palette.primary.main}` : "none",
                                    backgroundColor: "#fff"
                                }}
                                onClick={() => setSelectedSection("online")}
                            >
                                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                                    Online Payments
                                </Typography>
                                {renderMethodGrid(onlineMethods)}
                            </Paper>

                            <Paper
                                elevation={3}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: selectedSection === "offline" ? `2px solid ${theme.palette.primary.main}` : "none",
                                    backgroundColor: "#fff"
                                }}
                                onClick={() => setSelectedSection("offline")}
                            >
                                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
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
