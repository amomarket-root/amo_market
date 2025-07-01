import React, { useState, useEffect, useCallback } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import { styled, alpha } from "@mui/material/styles";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import LoginModal from "../Auth/LoginModal";
import CartModal from "../Cart/CartModel";
// import Location from "../Location/Location";
// import Location from "../Location/LocationIQ";
import Location from "../Location/LocationOpenStreetMap";

const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: alpha(theme.palette.common.black, 0.05),
    "&:hover": {
        backgroundColor: alpha(theme.palette.common.black, 0.1),
    },
    marginLeft: 0,
    width: "100%",
    border: `1px solid ${alpha(theme.palette.common.black, 0.15)}`,
    [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(1),
        width: "auto",
    },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("md")]: {
            width: "40ch",
        },
    },
}));

const Header = () => {
    const navigate = useNavigate();
    const [openLoginModal, setOpenLoginModal] = useState(false);
    const [openCartModel, setOpenCartModel] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [cartQuantity, setCartQuantity] = useState(0);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `${apiUrl}/portal/current_weather?latitude=${latitude}&longitude=${longitude}`
                    );
                    if (!response.ok) {
                        throw new Error("Failed to fetch weather data");
                    }
                    const data = await response.json();
                    if (data && data.data.weather[0].description) {
                        setWeatherData(data.data.weather[0].description);
                    } else {
                        setWeatherData("");
                    }
                } catch (error) {
                    console.error("Error fetching weather data:", error);
                }
            }
        );
    }, []);

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        if (userId) {
            window.Echo.channel(`cart_update.${userId}`)
                .listen('.cart.update', (data) => {
                    console.log("Cart updated via WebSocket in header:", data);
                    setCartQuantity(data?.cartSummary?.totalQuantity);
                });
        }

        return () => {
            if (userId) {
                window.Echo.leave(`cart_update.${userId}`);
            }
        };
    }, []); // Empty dependency array to run only once on mount

    const handleOpenLoginModal = () => {
        setOpenLoginModal(true);
    };

    const handleCloseLoginModal = () => {
        setOpenLoginModal(false);
    };

    const handleOpenCartModal = () => {
        const portal_token = localStorage.getItem("portal_token");
        if (portal_token) {
            setOpenCartModel(true);
        } else {
            handleOpenLoginModal();
        }
    };

    const handleCloseCartModal = () => {
        setOpenCartModel(false);
    };

    const handleLocationSelect = (description) => {
        // Handle the location selection logic
    };

    const handleAccountButtonClick = () => {
        const portal_token = localStorage.getItem("portal_token");
        if (portal_token) {
            navigate("/account");
        } else {
            handleOpenLoginModal();
        }
    };

    const getVideoSource = () => {
        if (weatherData === "broken clouds") {
            return "/videos/broken_clouds.mp4";
        }
        if (weatherData === "scattered clouds") {
            return "/videos/scattered_clouds.mp4";
        }
        return "/videos/default.mp4";
    };

    return (
        <AppBar
            sx={{
                backgroundColor: '#fff',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                color: 'transparent',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px',
                overflow: 'hidden',
                zIndex: 1100,
            }}
            position="sticky"
        >
            <Toolbar Toolbar style={{ marginBottom: 5, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={isMobile ? 6 : "auto"}>
                            <Box display="flex" alignItems="center">
                                {!isMobile && (
                                    <Typography
                                        mt={1}
                                        variant="h5"
                                        noWrap
                                        style={{ fontWeight: "bold", color: "#9F63FF" }}
                                    >
                                        Amo
                                        <span style={{ color: "#10d915" }}> Market</span>
                                    </Typography>
                                )}
                                <Location
                                    style={{ color: "#000", cursor: "pointer", marginLeft: !isMobile ? 20 : 0 }}
                                    onLocationSelect={handleLocationSelect}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={isMobile ? 6 : "auto"} display="flex" justifyContent="flex-end">
                            {isMobile && (
                                <IconButton sx={{ color: '#5b5858' }} color="inherit" onClick={handleAccountButtonClick}>
                                    <img
                                        src="/image/account_avatar.gif"
                                        alt="Profile"
                                        style={{ width: 40, height: 40, }}
                                    />
                                </IconButton>
                            )}
                        </Grid>
                        {isMobile && (
                            <Grid item xs={12}>
                                <Search style={{ backgroundColor: 'white', width: '100%' }}>
                                    <SearchIconWrapper sx={{ color: '#5b5858' }}>
                                        <SearchIcon />
                                    </SearchIconWrapper>
                                    <StyledInputBase
                                        placeholder="Search"
                                        inputProps={{ "aria-label": "search" }}
                                    />
                                </Search>
                            </Grid>
                        )}
                    </Grid>
                </Box>
                {!isMobile && (
                    <>
                        <div style={{ flexGrow: 2, display: "flex", justifyContent: "center", marginTop: 5 }}>
                            <Search style={{ backgroundColor: 'white', marginLeft: 20 }}>
                                <SearchIconWrapper sx={{ color: '#5b5858' }}>
                                    <SearchIcon />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="Search"
                                    inputProps={{ "aria-label": "search" }}
                                />
                            </Search>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginTop: 5, marginLeft: 40 }}>
                            <IconButton sx={{ color: '#5b5858' }} color="inherit" onClick={handleAccountButtonClick}>
                                <AccountCircleTwoToneIcon fontSize="large" />
                                <Typography variant="body1" style={{ marginLeft: 5 }}>
                                    {localStorage.getItem("portal_token") ? "Account" : "Login"}
                                </Typography>
                            </IconButton>
                            <IconButton
                                color="inherit"
                                style={{
                                    backgroundColor: 'green',
                                    borderRadius: 8,
                                    marginLeft: 20,
                                }}
                                onClick={handleOpenCartModal}
                            >
                                <Badge badgeContent={cartQuantity} color="secondary">
                                    <ShoppingCartIcon style={{ color: "white" }} />
                                </Badge>
                                <Typography variant="body1" style={{ marginLeft: 5, color: "white" }}>
                                    My Cart
                                </Typography>
                            </IconButton>
                        </div>
                    </>
                )}
                <LoginModal open={openLoginModal} onClose={handleCloseLoginModal} />
                <CartModal open={openCartModel} onClose={handleCloseCartModal} />
            </Toolbar>
            {
                weatherData && (
                    <video
                        key={weatherData}
                        autoPlay
                        muted
                        loop
                        style={{
                            position: "absolute",
                            zIndex: -1,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderBottomLeftRadius: 20,
                            borderBottomRightRadius: 20,
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                            top: 0,
                            left: 0,
                        }}
                    >
                        <source src={getVideoSource()} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                )
            }
        </AppBar>
    );
};

export default Header;
