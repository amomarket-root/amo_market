import React, { useState } from "react";
import axios from "axios";
import { useSweetAlert } from '../Theme/SweetAlert';
import { useSnackbar } from '../Theme/SnackbarAlert';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Card, CardContent, Container, Typography, TextField, Button, Grid, Box } from "@mui/material";
import "./css/RegisterPage.css";

const theme = createTheme({
    palette: {
        primary: {
            main: "#9F63FF", // Custom primary color
        },
    },
});

const RegisterPage = () => {
    const navigate = useNavigate();
    const showAlert = useSweetAlert();
    const showSnackbar = useSnackbar();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password_confirmation, setPassword_confirmation] = useState("");
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const apiUrl = import.meta.env.VITE_API_URL;

    const handleRegister = async (e) => {
        e.preventDefault();
        setNameError("");
        setEmailError("");
        setPasswordError("");
        setIsLoading(true);

        try {
            const response = await axios.post(`${apiUrl}/portal/authenticate/register`, {
                name,
                email,
                password,
                password_confirmation,
                role: 8, // Directly pass role value 8
            });
            showAlert({
                icon: "success",
                title: response.data.message,
                text: response.data.info,
                showConfirmButton: true,
                timer: 5000,
                timerProgressBar: true,
                confirmButtonText: "OK",
            }).then(() => {
                navigate('/login');
            });
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                if (error.response.data.errors.name) {
                    setNameError(error.response.data.errors.name[0]);
                }
                if (error.response.data.errors.email) {
                    setEmailError(error.response.data.errors.email[0]);
                }
                if (error.response.data.errors.password) {
                    setPasswordError(error.response.data.errors.password[0]);
                }
            } else {
                showSnackbar(error.response.data.message, { severity: 'error' }, 2000);
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
                    {/* Left side with half-circle and image */}
                    <Grid item xs={12} md={6} order={1}>
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                            position="relative"
                        >
                            <div className="half-circle-register" /> {/* Half-circle div */}
                            <img src="/image/register.webp" alt="register" style={{ maxWidth: "100%" }} />
                        </Box>
                    </Grid>
                    {/* Right side with registration form */}
                    <Grid item xs={12} md={6} order={2}>
                        <Card
                            elevation={20}
                            sx={{
                                maxWidth: "400px",
                                borderRadius: 3,
                                width: "100%",
                                height: "fit-content",
                                marginLeft: !isMobile ? "100px" : "0",
                            }}
                        >
                            <CardContent sx={{ py: 1 }}>
                                <div>
                                    <Typography variant="h5" gutterBottom>
                                        New here?
                                    </Typography>
                                    <Typography variant="h6" gutterBottom>
                                        <span style={{ textAlign: "right" }}>
                                            Signing up is easy. It only takes a few steps
                                        </span>
                                    </Typography>
                                </div>
                                <form onSubmit={handleRegister}>
                                    <TextField
                                        placeholder="Name"
                                        variant="outlined"
                                        fullWidth
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        error={!!nameError}
                                        helperText={nameError}
                                        sx={{ mb: 1 }}
                                    />
                                    <TextField
                                        placeholder="Email"
                                        variant="outlined"
                                        fullWidth
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        error={!!emailError}
                                        helperText={emailError}
                                        sx={{ mb: 1 }}
                                    />
                                    <TextField
                                        placeholder="Password"
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        error={!!passwordError}
                                        helperText={passwordError}
                                        sx={{ mb: 1 }}
                                    />
                                    <TextField
                                        placeholder="Confirm Password"
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        value={password_confirmation}
                                        onChange={(e) => setPassword_confirmation(e.target.value)}
                                        sx={{ mb: 1 }}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        size="large"
                                        style={{ marginTop: "0.5rem" }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Loading..." : "Sign Up"}
                                    </Button>
                                    <Typography
                                        variant="body1"
                                        align="center"
                                        style={{ marginTop: "0.5rem" }}
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

export default RegisterPage;
