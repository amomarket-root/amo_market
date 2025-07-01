import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Card, CardContent, Container, Typography, TextField, Button, Grid, Box } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import "./css/LoginPage.css";
import { useSweetAlert } from '../Theme/SweetAlert';
import { useSnackbar } from '../Theme/SnackbarAlert';

const theme = createTheme({
    palette: {
        primary: {
            main: "#9F63FF", // Your custom color
        },
    },
});

const LoginPage = () => {
    const navigate = useNavigate();
    const showAlert = useSweetAlert();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const showSnackbar = useSnackbar();
    const isMobile = useMediaQuery("(max-width:600px)");
    const apiUrl = import.meta.env.VITE_API_URL;

    const handleLogin = async (e) => {
        e.preventDefault();
        setEmailError('');
        setPasswordError('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${apiUrl}/portal/authenticate/login`, {
                email,
                password
            });
            showSnackbar(response.data.message, { severity: 'success' });
            if (localStorage.getItem('portal_token')) {
                localStorage.removeItem('portal_token');
                localStorage.removeItem('user_id');
            }
            setTimeout(() => {
                localStorage.setItem("portal_token", response.data.portal_token);
                localStorage.setItem("user_id", response.data.user_id);
                navigate('/');
            }, 2000);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                if (error.response.data.errors.email) {
                    setEmailError(error.response.data.errors.email[0]);
                }
                if (error.response.data.errors.password) {
                    setPasswordError(error.response.data.errors.password[0]);
                }
            } else {
                showAlert({
                    title: error.response.data.message,
                    text: error.response.data.info,
                    icon: "warning",
                    timer: 6000,
                    showConfirmButton: true,
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
                    <Grid item xs={12} md={6} order={isMobile ? 2 : 1}>
                        <Card elevation={20} sx={{ maxWidth: '400px', width: '100%', borderRadius: 3 }}>
                            <CardContent>
                                <div>
                                    <Typography variant="h5" gutterBottom>
                                        Hello! Let's get started
                                    </Typography>
                                    <Typography variant="h6" gutterBottom>
                                        <span style={{ textAlign: 'right' }}>Sign in to continue.</span>
                                    </Typography>
                                </div>
                                <form onSubmit={handleLogin}>
                                    <TextField
                                        label="Email"
                                        placeholder="Enter Email"
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        error={!!emailError}
                                        helperText={emailError}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />

                                    <TextField
                                        label="Password"
                                        placeholder="Enter Password"
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        error={!!passwordError}
                                        helperText={passwordError}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        size="large"
                                        style={{ marginTop: '1rem' }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Loading...' : 'Login'}
                                    </Button>
                                    <Typography variant="body1" align="center" style={{ marginTop: '1rem' }}>
                                        <Link to="/forgotPassword">Forgot Password?</Link>
                                    </Typography>
                                    <Typography variant="body1" align="center">
                                        Don't have an account? <Link to="/register">Sign Up</Link>
                                    </Typography>
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6} order={isMobile ? 1 : 2}>
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <div className="half-circle-login" />
                            <img src="/image/login.webp" alt="login" style={{ maxWidth: '100%' }} />
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    );
};

export default LoginPage;
