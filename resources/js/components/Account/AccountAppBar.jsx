import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Location from '../Location/Location';
import { useNavigate } from 'react-router-dom';

const AccountAppBar = ({ handleLocationSelect }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const handleBackClick = () => {
        navigate(-1);
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
            }}
            position="sticky"
        >
            <Toolbar style={{ marginBottom: 10, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={isMobile ? 6 : "auto"}>
                            <Box display="flex" alignItems="center">
                                {isMobile && (
                                    <IconButton
                                        edge="end"
                                        color="inherit"
                                        onClick={handleBackClick}
                                        aria-label="back"
                                        sx={{ color: '#5b5858', marginTop: 1, marginRight: 0.5 }}
                                    >
                                        <ArrowBackIcon />
                                    </IconButton>
                                )}
                                <Typography
                                    variant="h5"
                                    noWrap
                                    style={{ fontWeight: "bold", color: "#2EDF0F" }}
                                >
                                    Amo
                                    <span style={{ color: "#7528FA" }}> Market</span>
                                </Typography>
                                <Location
                                    style={{ color: "#000", cursor: "pointer", marginLeft: !isMobile ? 20 : 0 }}
                                    onLocationSelect={handleLocationSelect}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default AccountAppBar;
