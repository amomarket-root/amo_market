import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from '@mui/material/useMediaQuery';
import { Card, CardContent, Container, Typography, TextField, Button, Grid, Box } from "@mui/material";
import { useSweetAlert } from '../Theme/SweetAlert';
import { useSnackbar } from '../Theme/SnackbarAlert';
import "./css/ForgotPasswordPage.css";

const theme = createTheme({
    palette: {
        primary: {
            main: "#9F63FF", // Your custom color
        },
    },
});

const ForgotPasswordPage = () => {
    const showAlert = useSweetAlert();
    const showSnackbar = useSnackbar();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const apiUrl = import.meta.env.VITE_API_URL;

    const handleLogin = async (e) => {
        e.preventDefault();
        setEmailError("");
        setIsLoading(true);

        try {
            const response = await axios.post(
                `${apiUrl}/portal/authenticate/forgot_password`,
                {
                    email,
                }
            );

            showSnackbar(response.data.message, { severity: 'success' }, 2000);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                if (error.response.data.errors.email) {
                    setEmailError(error.response.data.errors.email[0]);
                }
            } else {
                showAlert({
                    icon: "warning",
                    title: error.response.data.message || "An error occurred",
                    text: error.response.data.info || "Please try again later.",
                    showConfirmButton: true,
                    timer: 6000,
                    timerProgressBar: true,
                    confirmButtonText: "OK",
                });
            }
        } finally {
            setIsLoading(false);
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
                    <Grid item xs={12} md={6} order={1}>
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <div className="half-circle-forgot" /> {/* Half-circle div */}
                            <img src="/image/forgot_password.webp" alt="forgot_password" style={{ maxWidth: "100%" }} />
                        </Box>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        md={6}
                        order={2}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Card elevation={20} sx={{ maxWidth: "400px", width: "100%", borderRadius: 3, marginLeft: !isMobile ? "100px" : "0", }}>
                            <CardContent>
                                <div>
                                    <Typography variant="h5" gutterBottom>
                                        Hello! You forgot your credentials?
                                    </Typography>
                                    <Typography variant="h6" gutterBottom>
                                        <span style={{ textAlign: "right" }}>Enter your email to continue.</span>
                                    </Typography>
                                </div>
                                <form onSubmit={handleLogin}>
                                    <TextField
                                        label="Email"
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        error={!!emailError}
                                        helperText={emailError}
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
                                        {isLoading ? "Loading..." : "Submit"}
                                    </Button>
                                    <Typography
                                        variant="body1"
                                        align="center"
                                        style={{ marginTop: "1rem" }}
                                    >
                                        Already have an account? <Link to="/login">Sign In</Link>
                                    </Typography>
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    );
};

export default ForgotPasswordPage;
