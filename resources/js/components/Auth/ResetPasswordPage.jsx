import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSweetAlert } from '../Theme/SweetAlert';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Card, CardContent, Container, Typography, TextField, Button, Grid, Box, } from "@mui/material";
import useMediaQuery from '@mui/material/useMediaQuery';
import "./css/ResetPasswordPage.css";

const theme = createTheme({
    palette: {
        primary: {
            main: "#9F63FF", // Your custom color
        },
    },
});

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const showAlert = useSweetAlert();
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordConfirmationError, setPasswordConfirmationError] = useState("");
    const [isLoading, setIsLoading] = useState(false); // State to track loading
    const isMobile = useMediaQuery("(max-width:600px)");
    const apiUrl = import.meta.env.VITE_API_URL;

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordConfirmationError("");
        setIsLoading(true); // Set loading to true on form submission

        try {
            const token = new URLSearchParams(window.location.search).get("token");
            const response = await axios.post(
                `${apiUrl}/portal/authenticate/reset_password?token=${token}`,
                {
                    password,
                    password_confirmation: passwordConfirmation,
                }
            );
            showAlert({
                icon: "success",
                title: response.data.message,
                text: response.data.info,
                showConfirmButton: true,
                timer: 20000,
                timerProgressBar: true,
                confirmButtonText: "OK",
            }).then(() => {
                navigate('/login');
            });
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                if (error.response.data.errors.password) {
                    setPasswordError(error.response.data.errors.password[0]);
                }
                if (error.response.data.errors.password_confirmation) {
                    setPasswordConfirmationError(
                        error.response.data.errors.password_confirmation[0]);
                }
            } else {
                showAlert({
                    icon: "warning",
                    title: error.response.data.message,
                    text: error.response.data.info,
                    showConfirmButton: true,
                    timer: 20000,
                    timerProgressBar: true,
                    confirmButtonText: "OK",
                }).then(() => {
                    navigate('/forgotPassword');
                });
            }
        } finally {
            setIsLoading(false); // Reset loading after request completes
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6} order={isMobile ? 2 : 1} display="flex" justifyContent="center" alignItems="center">
                        <Card elevation={20} sx={{ maxWidth: "400px", width: "100%", borderRadius: 3 }}>
                            <CardContent>
                                <div>
                                    <Typography variant="h5" gutterBottom>
                                        Hello! Just enter a new password
                                    </Typography>
                                    <Typography variant="h6" gutterBottom>
                                        <span style={{ textAlign: "right" }}>
                                            Update password to continue.
                                        </span>
                                    </Typography>
                                </div>
                                <form onSubmit={handleResetPassword}>
                                    <TextField
                                        label="Password"
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        error={!!passwordError}
                                        helperText={passwordError}
                                    />
                                    <TextField
                                        label="Password Confirmation"
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        error={!!passwordConfirmationError}
                                        helperText={passwordConfirmationError}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        size="large"
                                        style={{ marginTop: "1rem" }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Updating..." : "Update"}
                                    </Button>
                                    <Typography
                                        variant="body1"
                                        align="center"
                                        style={{ marginTop: "1rem" }}
                                    >
                                        Sign in with old credentials? <Link to="/login">Sign In</Link>
                                    </Typography>
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6} order={isMobile ? 1 : 2}>
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                        >
                            <div className="half-circle-reset" /> {/* Half-circle div */}
                            <img
                                src="/image/reset_password.webp"
                                alt="reset_password"
                                style={{ maxWidth: "100%" }}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    );
};

export default ResetPasswordPage;
