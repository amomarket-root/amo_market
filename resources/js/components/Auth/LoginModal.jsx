import React, { useState } from 'react';
import axios from "axios";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import OTPVerificationModal from "./OTPVerificationModal";
import { useNavigate } from 'react-router-dom';
import { useSweetAlert } from '../Theme/SweetAlert';
import { useSnackbar } from '../Theme/SnackbarAlert';

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

    const handleGoogleLogin = () => {
        try {
            window.location.href = `${apiUrl}/portal/authenticate/google`;
        } catch (error) {
            console.error("Error while logging in with Google:", error);
            showAlert({
                title: "Error!",
                text: "Error while logging in with Google:", error,
                icon: "error",
            });
        }
    }

    const handleFacebookLogin = () => {
        try {
            window.location.href = `${apiUrl}/portal/authenticate/facebook`;
        } catch (error) {
            console.error("Error while logging in with Facebook:", error);
            showAlert({
                title: "Error!",
                text: "Error while logging in with Facebook:", error,
                icon: "error",
            });
        }
    }

    const handleMailLogin = () => {
        navigate('/login');
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setNameError("");
        setNumberError("");
        setIsLoading(true);

        try {
            const response = await axios.post(
                `${apiUrl}/portal/authenticate/auth_mobile`,
                { name, number }
            );

            console.log("Response from server:", response.data);

            if (localStorage.getItem('otp_token')) {
                localStorage.removeItem('otp_token');
            }
            localStorage.setItem("otp_token", response.data.token);

            // Show initial success message for 1 second
            showSnackbar(response.data.message, { severity: 'success' }, 1000);
            // After 1 second, close the modal and show OTP
            setTimeout(() => {
                onClose(false);
                setOtpOpen(true);
                // Show OTP for 8 seconds (shorter duration)
                showSnackbar(`Your OTP is: ${response.data.otp}`, { severity: 'info' }, 8000);
            }, 1000);

        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                if (error.response.data.errors.name) {
                    setNameError(error.response.data.errors.name[0]);
                }
                if (error.response.data.errors.number) {
                    setNumberError(error.response.data.errors.number[0]);
                }
            } else {
                showSnackbar(error.response?.data?.message || 'An error occurred during login', { severity: 'error' }, 2000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Mobile Verification Dialog */}
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="xs"
                fullWidth
                sx={{ borderRadius: 6 }}
                PaperProps={{ style: { borderRadius: '15px' } }}
            >
                <DialogTitle sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" component="span" fontWeight="bold">
                        India's 20 minute app
                    </Typography>
                    <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <form onSubmit={handleLogin}>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 0 }}>
                        <Typography variant="body1" gutterBottom>
                            Log in or Sign up
                        </Typography>

                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            label="Enter your name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={!!nameError}
                            helperText={nameError}
                        />

                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="mobile"
                            label="Enter mobile number"
                            type="tel"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            error={!!numberError}
                            helperText={numberError}
                            InputProps={{
                                startAdornment: <Typography variant="body1" style={{ marginRight: 8 }}>+91</Typography>
                            }}
                        />
                    </DialogContent>

                    <DialogActions sx={{ justifyContent: 'center', marginLeft: '18px', marginRight: '18px' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                            fullWidth
                            size="large"
                            sx={{ borderRadius: "4px", height: 50 }}
                            disabled={isLoading}
                        >
                            {isLoading ? "Loading..." : "Continue"}
                        </Button>
                    </DialogActions>
                </form>

                <Box
                    display="flex"
                    justifyContent="space-around"
                    alignItems="center"
                    mt={1}
                    px={2}
                >
                    <Button
                        variant="outlined"
                        sx={{
                            borderRadius: "50%",
                            padding: 0,
                            width: 65,
                            height: 65,
                            borderColor: "#f27474",
                            color: "#f27474",
                            '&:hover': {
                                borderColor: "#f27474",
                                backgroundColor: "rgba(242, 116, 116, 0.1)",
                            }
                        }}
                        onClick={handleGoogleLogin}
                    >
                        <GoogleIcon fontSize="large" sx={{ color: "#f27474" }} />
                    </Button>

                    <Button
                        variant="outlined"
                        sx={{
                            borderRadius: "50%",
                            padding: 0,
                            width: 65,
                            height: 65,
                            borderColor: "#0f85d9",
                            color: "#0f85d9",
                            '&:hover': {
                                borderColor: "#0f85d9",
                                backgroundColor: "rgba(15, 133, 217, 0.1)",
                            }
                        }}
                        onClick={handleFacebookLogin}
                    >
                        <FacebookIcon fontSize="large" />
                    </Button>

                    <Button
                        variant="outlined"
                        sx={{
                            borderRadius: "50%",
                            padding: 0,
                            width: 65,
                            height: 65,
                            borderColor: "#9F63FF",
                            color: "#9F63FF",
                            '&:hover': {
                                borderColor: "#9F63FF",
                                backgroundColor: "rgba(159, 99, 255, 0.1)",
                            }
                        }}
                        onClick={handleMailLogin}
                    >
                        <EmailIcon fontSize="large" />
                    </Button>
                </Box>

                <div style={{ padding: 16, textAlign: 'center' }}>
                    <Typography variant="body2">
                        By continuing, you agree to our <button style={{ background: 'none', border: 'none', color: 'grey', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</button> & <button style={{ background: 'none', border: 'none', color: 'grey', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</button>
                    </Typography>
                </div>
            </Dialog>

            {/* OTP Verification Dialog */}
            <OTPVerificationModal
                otpOpen={otpOpen}
                setOtpOpen={setOtpOpen}
                mobileNumber={number}
            />
        </>
    );
};

export default LoginModal;
