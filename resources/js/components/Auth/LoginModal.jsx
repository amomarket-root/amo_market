import React, { useState } from "react";
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Avatar from "@mui/material/Avatar";
import OTPVerificationModal from "./OTPVerificationModal";
import { useNavigate } from "react-router-dom";
import { useSweetAlert } from "../Theme/SweetAlert";
import { useSnackbar } from "../Theme/SnackbarAlert";

const LoginModal = ({ open, onClose }) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [name, setName] = useState("");
    const [number, setNumber] = useState("");
    const [nameError, setNameError] = useState("");
    const [numberError, setNumberError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [otpOpen, setOtpOpen] = useState(false);
    const showAlert = useSweetAlert();
    const showSnackbar = useSnackbar();
    const navigate = useNavigate();

    const checkAlreadyLoggedIn = () => {
        const token = localStorage.getItem("portal_token");
        const userId = localStorage.getItem("user_id");
        return token && userId;
    };

    const handleGoogleLogin = () => {
        try {
            if (checkAlreadyLoggedIn()) {
                showAlert({
                    title: "Already Logged In",
                    text: "Please logout first before logging in again",
                    icon: "warning",
                });
                return;
            }
            localStorage.removeItem("portal_token");
            localStorage.removeItem("user_id");
            window.location.href = `${apiUrl}/login/google`;
        } catch (error) {
            showAlert({
                title: "Error!",
                text: "Google login failed: " + error.message,
                icon: "error",
            });
        }
    };

    const handleFacebookLogin = () => {
        try {
            if (checkAlreadyLoggedIn()) {
                showAlert({
                    title: "Already Logged In",
                    text: "Please logout first before logging in again",
                    icon: "warning",
                });
                return;
            }
            localStorage.removeItem("portal_token");
            localStorage.removeItem("user_id");
            window.location.href = `${apiUrl}/login/facebook`;
        } catch (error) {
            showAlert({
                title: "Error!",
                text: "Facebook login failed",
                icon: "error",
            });
        }
    };

    const validateForm = () => {
        let valid = true;
        const trimmedName = name.trim();
        const trimmedNumber = number.trim();

        setNameError("");
        setNumberError("");

        if (!trimmedName) {
            setNameError("Name is required");
            valid = false;
        } else if (trimmedName.length < 2) {
            setNameError("Name must be at least 2 characters");
            valid = false;
        }

        const mobileRegex = /^[6-9]\d{9}$/;
        if (!trimmedNumber) {
            setNumberError("Mobile number is required");
            valid = false;
        } else if (!mobileRegex.test(trimmedNumber)) {
            setNumberError("Enter a valid 10-digit Indian mobile number");
            valid = false;
        }

        return valid;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (checkAlreadyLoggedIn()) {
            showAlert({
                title: "Already Logged In",
                text: "Please logout first before logging in again",
                icon: "warning",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(
                `${apiUrl}/portal/authenticate/auth_mobile`,
                { name: name.trim(), number: number.trim() }
            );

            localStorage.removeItem("otp_token");
            localStorage.setItem("otp_token", response.data.token);

            showSnackbar(response.data.message, { severity: "success" }, 1000);
            setTimeout(() => {
                onClose(false);
                setOtpOpen(true);
                showSnackbar(
                    `Your OTP is: ${response.data.otp}`,
                    { severity: "info" },
                    8000
                );
            }, 1000);
        } catch (error) {
            if (error.response?.data?.errors) {
                const errs = error.response.data.errors;
                if (errs.name) setNameError(errs.name[0]);
                if (errs.number) setNumberError(errs.number[0]);
            } else {
                showSnackbar(
                    error.response?.data?.message ||
                    "An error occurred during login",
                    { severity: "error" },
                    2000
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Clear errors while typing if field becomes valid
    const handleNameChange = (e) => {
        const val = e.target.value;
        setName(val);
        if (val.trim().length >= 2) setNameError("");
    };

    const handleNumberChange = (e) => {
        const val = e.target.value;
        setNumber(val);
        const mobileRegex = /^[6-9]\d{9}$/;
        if (mobileRegex.test(val.trim())) setNumberError("");
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="xs"
                fullWidth
                PaperProps={{ style: { borderRadius: "12px" } }}
            >
                <DialogTitle sx={{ textAlign: "center", pb: 0 }}>
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                    >
                        <Avatar
                            alt="App Logo"
                            src="/image/amo_market_icon.webp"
                            loading="eager"
                            decoding="async"
                            sx={{
                                width: 55,
                                height: 55,
                                mb: 0.5,
                                bgcolor: "white",
                                "& img": {
                                    objectFit: "contain",
                                    width: "100%",
                                    height: "100%",
                                },
                            }}
                        />
                        <Typography variant="h6" fontWeight="bold">
                            India's 20 minute delivery app
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        sx={{ position: "absolute", right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <form onSubmit={handleLogin}>
                    <DialogContent sx={{ pt: 0.5, px: 3 }}>
                        <Typography variant="body1" align="center" gutterBottom>
                            Log in or Sign up
                        </Typography>

                        <TextField
                            variant="outlined"
                            margin="dense"
                            fullWidth
                            label="Enter your name"
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            error={!!nameError}
                            helperText={nameError}
                        />

                        <TextField
                            variant="outlined"
                            margin="dense"
                            fullWidth
                            label="Enter mobile number"
                            type="tel"
                            value={number}
                            onChange={handleNumberChange}
                            error={!!numberError}
                            helperText={numberError}
                            InputProps={{
                                startAdornment: (
                                    <Typography variant="body1" sx={{ mr: 1 }}>
                                        +91
                                    </Typography>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                            fullWidth
                            sx={{ borderRadius: "6px", height: 42, mt: 0.5, color: "white" }}
                            disabled={isLoading}
                        >
                            {isLoading ? "Loading..." : "Continue"}
                        </Button>
                    </DialogContent>
                </form>

                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap={8}
                    sx={{ mb: 1 }}
                >
                    <IconButton
                        onClick={handleGoogleLogin}
                        sx={{
                            width: 65,
                            height: 65,
                            "&:hover": {
                                backgroundColor: "rgba(242, 116, 116, 0.1)",
                            },
                        }}
                    >
                        <Avatar
                            src="/image/auth/google_logo.webp"
                            alt="Google"
                            loading="eager"
                            decoding="async"
                            sx={{
                                width: 50,
                                height: 50,
                                border: "1px solid #f27474",
                            }}
                        />
                    </IconButton>

                    <IconButton
                        onClick={handleFacebookLogin}
                        sx={{
                            width: 65,
                            height: 65,
                            "&:hover": {
                                backgroundColor: "rgba(15, 133, 217, 0.1)",
                            },
                        }}
                    >
                        <Avatar
                            src="/image/auth/facebook_logo.webp"
                            alt="Facebook"
                            loading="eager"
                            decoding="async"
                            sx={{
                                width: 50,
                                height: 50,
                                border: "1px solid #0f85d9",
                            }}
                        />
                    </IconButton>
                </Box>

                <Box sx={{ px: 2, pb: 2, textAlign: "center" }}>
                    <Typography variant="body2">
                        By continuing, you agree to our{" "}
                        <button
                            style={{
                                background: "none",
                                border: "none",
                                color: "grey",
                                textDecoration: "underline",
                                cursor: "pointer",
                            }}
                        >
                            Terms of Service
                        </button>{" "}
                        &{" "}
                        <button
                            style={{
                                background: "none",
                                border: "none",
                                color: "grey",
                                textDecoration: "underline",
                                cursor: "pointer",
                            }}
                        >
                            Privacy Policy
                        </button>
                    </Typography>
                </Box>
            </Dialog>

            <OTPVerificationModal
                otpOpen={otpOpen}
                setOtpOpen={setOtpOpen}
                mobileNumber={number}
            />
        </>
    );
};

export default LoginModal;
