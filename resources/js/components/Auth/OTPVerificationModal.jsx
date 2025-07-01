import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Typography, CircularProgress } from "@mui/material";
import { useSnackbar } from '../Theme/SnackbarAlert';

const OTPVerificationModal = ({ otpOpen, setOtpOpen, mobileNumber }) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const showSnackbar = useSnackbar();
    const [otpError, setOtpError] = useState('');
    const navigate = useNavigate();

    // Handle input change for OTP fields
    const handleChange = (e, index) => {
        const newOtp = [...otp];
        newOtp[index] = e.target.value.slice(-1); // Only allow 1 digit per field
        setOtp(newOtp);

        // Automatically focus on the next field
        if (e.target.value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    // Function to handle OTP submission
    const handleSubmit = async () => {
        const enteredOtp = otp.join("");
        setOtpError('');
        const token = localStorage.getItem('otp_token');
        const formData = new FormData();
        formData.append('otp', enteredOtp);

        setIsSubmitting(true);

        try {
            // Make API call to verify OTP
            const response = await axios.post(`${apiUrl}/portal/authenticate/verify_Otp`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            showSnackbar(response.data.message, { severity: 'success' }, 1000);

            if (localStorage.getItem('portal_token')) {
                localStorage.removeItem('portal_token');
            }
            // Store New Auth Token In LocalStorage
            localStorage.setItem("portal_token", response.data.portal_token);
            setOtpOpen(false);
            navigate('/'); // Navigate to home page
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                if (error.response.data.errors.otp) {
                    setOtpError(error.response.data.errors.otp[0]);
                    showSnackbar(error.response.data.errors.otp[0], { severity: 'error' }, 2000);
                }
            } else {
                console.error('Server error:', error.response?.data?.message);
                  showSnackbar(error.response?.data?.message || 'An error occurred during OTP verification', { severity: 'error' }, 2000);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog
                sx={{ borderRadius: 6 }} // Increase border radius
                PaperProps={{ style: { borderRadius: '15px' } }}
                open={otpOpen}
                onClose={() => setOtpOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle fontWeight="bold" sx={{ textAlign: "center" }}>
                    OTP Verification
                </DialogTitle>
                <DialogContent sx={{ textAlign: "center" }}>
                    <Typography variant="body1" gutterBottom>
                        Enter The Verification Code Sent To <br />
                        <b>+91{mobileNumber}</b>
                    </Typography>
                    <Grid container spacing={1} justifyContent="center">
                        {otp.map((digit, index) => (
                            <Grid item key={index}>
                                <TextField
                                    id={`otp-${index}`}
                                    value={digit}
                                    onChange={(e) => handleChange(e, index)}
                                    inputProps={{
                                        maxLength: 1,
                                        style: {
                                            textAlign: "center",
                                            width: "15px",
                                            height: "15px",
                                            fontSize: "15px",
                                        },
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                        ))}
                    </Grid>
                    {otpError && <Typography color="error">{otpError}</Typography>}
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center" }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={handleSubmit}
                        sx={{ borderRadius: "4px", height: 50, marginBottom: 5 }}
                        disabled={otp.includes("") || isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : "Verify OTP"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default OTPVerificationModal;
