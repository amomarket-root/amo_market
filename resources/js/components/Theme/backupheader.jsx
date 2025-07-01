import React, { useEffect, useState } from "react";
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
import LoginModal from "../Auth/LoginModal";
import CartModal from "../Cart/CartModel";
//import AccountModal from "./Account/AccountModal";
import Location from "../Location/Location";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

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
  //const [openAccountModal, setOpenAccountModal] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `http://127.0.0.1:8000/api/portal/current_weather?latitude=${latitude}&longitude=${longitude}`
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

  const handleOpenLoginModal = () => {
    setOpenLoginModal(true);
  };

  const handleCloseLoginModal = () => {
    setOpenLoginModal(false);
  };

  // const handleOpenAccountModal = () => {
  //   setOpenAccountModal(true);
  // };

  // const handleCloseAccountModal = () => {
  //   setOpenAccountModal(false);
  // };

  const handleOpenCartModal = () => {
    setOpenCartModel(true);
  };

  const handleCloseCartModal = () => {
    setOpenCartModel(false);
  };

  const handleLocationSelect = (description) => {
    // Handle the location selection logic
  };

  const handleAccountButtonClick = () => {
    const portal_token = localStorage.getItem("portal_token");
    //alert(portal_token);
    if (portal_token) {
      //handleOpenAccountModal(); // Open account modal if portal_token exists
      navigate("/account");
    } else {
      handleOpenLoginModal(); // Otherwise, open login modal
    }
  };

  const getVideoSource = () => {
    if (weatherData === "broken clouds") {
      return "/videos/broken_clouds.mp4";
    }
    if (weatherData === "scattered clouds") {
      return "/videos/scattered_clouds.mp4";
    }
    // Add more conditions for different weather descriptions and corresponding video sources
    return "/videos/default.mp4"; // Fallback video source
  };

  return (
    <>
      <AppBar
        sx={{
          backgroundColor: '#fff',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          color: 'transparent',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
          overflow: 'hidden',
        }}
        position="sticky"
      >
        <Toolbar style={{ marginBottom: 10, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={isMobile ? 6 : "auto"}>
                <Box display="flex" alignItems="center">
                  {!isMobile && (
                    <Typography
                      variant="h5"
                      noWrap
                      style={{ fontWeight: "bold", color: "#2EDF0F" }}
                    >
                      Amo
                      <span style={{ color: "#7528FA" }}> Market</span>
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
                      style={{ width: 50, height: 50,}}
                    />
                  </IconButton>
                )}
              </Grid>
              {/* Second Line (Search Bar) */}
              {isMobile && (
                <Grid item xs={12} mt={1}>
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
          {/* The section that only displays on larger screens */}
          {!isMobile && (
            <>
              <div style={{ flexGrow: 2, display: "flex", justifyContent: "center", marginTop: 10, marginLeft: -120 }}>
                <Search style={{ backgroundColor: 'white' }}>
                  <SearchIconWrapper sx={{ color: '#5b5858' }}>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Search"
                    inputProps={{ "aria-label": "search" }}
                  />
                </Search>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
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
                  <Badge badgeContent={localStorage.getItem('cart_quantity') ? Number(localStorage.getItem('cart_quantity')) : ''} color="secondary">
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
          {/* Add your Account Modal component here */}
          {/* <AccountModal open={openAccountModal} onClose={handleCloseAccountModal} /> */}
        </Toolbar>
        {weatherData && (
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
        )}
      </AppBar>
    </>
  );
};

export default Header;
