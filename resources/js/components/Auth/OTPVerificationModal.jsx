import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    Typography,
    CircularProgress,
    Box
} from "@mui/material";
import { useSnackbar } from '../Theme/SnackbarAlert';

const OTPVerificationModal = ({ otpOpen, setOtpOpen, mobileNumber }) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [countdown, setCountdown] = useState(20);
    const [canResend, setCanResend] = useState(false);
    const showSnackbar = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (countdown > 0 && otpOpen) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [countdown, otpOpen]);

    const handleChange = (e, index) => {
        const newOtp = [...otp];
        newOtp[index] = e.target.value.slice(-1);
        setOtp(newOtp);

        if (e.target.value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleResendOTP = async () => {
        try {
            setIsResending(true);
            setCanResend(false);
            setCountdown(20);

            const response = await axios.post(
                `${apiUrl}/portal/authenticate/resend_otp`,
                { number: mobileNumber }
            );

            localStorage.setItem("otp_token", response.data.token);

            showSnackbar('OTP resent successfully!', { severity: 'success' }, 2000);
        } catch (error) {
            setCanResend(true);
            showSnackbar(
                error.response?.data?.message || 'Failed to resend OTP',
                { severity: 'error' },
                2000
            );
        } finally {
            setIsResending(false);
        }
    };

    const handleSubmit = async () => {
        const enteredOtp = otp.join("");
        setOtpError('');
        const token = localStorage.getItem('otp_token');

        const formData = new FormData();
        formData.append('otp', enteredOtp);
        formData.append('number', mobileNumber);

        setIsSubmitting(true);

        try {
            const response = await axios.post(`${apiUrl}/portal/authenticate/verify_Otp`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            showSnackbar(response.data.message, { severity: 'success' }, 1000);

             if (localStorage.getItem('portal_token') && localStorage.removeItem('user_id')) {
                localStorage.removeItem('portal_token');
                localStorage.removeItem('user_id');
            }

            localStorage.setItem("portal_token", response.data.portal_token);
            localStorage.setItem('user_id', response.data.id);
            setOtpOpen(false);
            navigate('/');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                if (error.response.data.errors.otp) {
                    setOtpError(error.response.data.errors.otp[0]);
                    showSnackbar(error.response.data.errors.otp[0], { severity: 'error' }, 2000);
                }
                if (error.response.data.errors.number) {
                    showSnackbar(error.response.data.errors.number[0], { severity: 'error' }, 2000);
                }
            } else {
                showSnackbar(
                    error.response?.data?.message || 'An error occurred during OTP verification',
                    { severity: 'error' },
                    2000
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            open={otpOpen}
            onClose={() => setOtpOpen(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{ style: { borderRadius: '15px' } }}
        >
            <DialogTitle fontWeight="bold" sx={{ textAlign: "center" }}>
                OTP Verification
            </DialogTitle>

            <DialogContent sx={{ textAlign: "center" }}>
                <Typography variant="body1" gutterBottom>
                    Enter The Verification Code Sent To <br />
                    <b>+91{mobileNumber}</b>
                </Typography>

                <Typography variant="caption" color="error.main">
                    Note: OTP may arrive through SMS or voice call
                </Typography>

                <Grid container spacing={1} justifyContent="center" mt={1} mb={1}>
                    {otp.map((digit, index) => (
                        <Grid item key={index}>
                            <TextField
                                id={`otp-${index}`}
                                type="tel"
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

                {otpError && (
                    <Typography color="error" mt={1}>
                        {otpError}
                    </Typography>
                )}

                <Box mt={2}>
                    {!canResend ? (
                        <Typography variant="body2">
                            Resend OTP in {countdown} seconds
                        </Typography>
                    ) : (
                        <Button
                            variant="text"
                            color="primary"
                            onClick={handleResendOTP}
                            disabled={!canResend || isResending}
                        >
                            {isResending ? (
                                <CircularProgress size={20} />
                            ) : (
                                "Resend OTP"
                            )}
                        </Button>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ justifyContent: "center" }}>
                <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={handleSubmit}
                    sx={{ borderRadius: "4px", height: 50, marginBottom: 3, color: "white" }}
                    disabled={otp.includes("") || isSubmitting}
                >
                    {isSubmitting ? <CircularProgress size={24} /> : "Verify OTP"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OTPVerificationModal;
