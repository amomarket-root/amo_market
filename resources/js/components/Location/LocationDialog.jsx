import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationTwoToneIcon from '@mui/icons-material/MyLocationTwoTone';
import MapTwoToneIcon from '@mui/icons-material/MapTwoTone';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import GoogleMaps from './GoogleMaps';
import { useTheme, useMediaQuery } from '@mui/material';

const LocationDialog = ({
    open,
    onClose,
    loading,
    error,
    handleCurrentLocationClick,
    onLocationSelect,
    setError,
    fetchShops,
    handleClose,
    setLocation,
}) => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="location-dialog"
            PaperProps={{
                style: {
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    borderBottomLeftRadius: isDesktop ? 10 : 0,
                    borderBottomRightRadius: isDesktop ? 10 : 0,
                    width: isDesktop ? 420 : '90%',
                    maxWidth: isDesktop ? 420 : '90%',
                    padding: isDesktop ? "20px 25px" : "20px 20px",
                    height: isDesktop ? 'fit-content' : 'fit-content', // Increased height for desktop
                    margin: isDesktop ? '2px' : '0',
                    position: isDesktop ? 'fixed' : 'absolute',
                    left: isDesktop ? '5px' : 'auto',
                    top: isDesktop ? '2px' : 'auto',
                    bottom: isDesktop ? 'auto' : '0',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                },
            }}
            fullScreen={!isDesktop}
        >
            <DialogContent style={{
                padding: 0,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflowY: isDesktop ? 'auto' : 'auto',
                overflowX: 'hidden'
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                }}>
                    {/* Header Section */}
                    <Box>
                        <Typography variant="h6" style={{
                            fontWeight: "bold",
                            fontSize: 17,
                            paddingBottom: isDesktop ? '10px' : '20px',
                            lineHeight: 1.3
                        }}>
                            Welcome to <span style={{ color: '#2EDF0F' }}>Amo</span> <span style={{ color: '#7528FA' }}>Market</span>
                        </Typography>

                        <Box display="flex" alignItems="flex-start" mb={1}>
                            <LocationOnIcon style={{
                                fontSize: "40px",
                                marginRight: "12px",
                                color: "#9F63FF",
                                flexShrink: 0
                            }} />
                            <Typography variant="body2" style={{ lineHeight: 1.5 }}>
                                Enter your location to explore nearby products, services, and shops.
                            </Typography>
                        </Box>
                        <Divider sx={{ flexGrow: 1, margin: 1 }} />
                    </Box>

                    {/* Main Content Section */}
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: isDesktop ? 'hidden' : 'auto'
                    }}>
                        <Box>
                            {/* Current Location Button */}
                            <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={0.5}>
                                <Tooltip title="Use Current Location">
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<MyLocationTwoToneIcon />}
                                        onClick={handleCurrentLocationClick}
                                        style={{
                                            borderRadius: 15,
                                            textTransform: "none",
                                            fontWeight: "bold",
                                            fontSize: 15,
                                            padding: '8px 16px',
                                            width: "auto",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} /> : "Current Location"}
                                    </Button>
                                </Tooltip>

                                <Tooltip title="Select Location on Map">
                                    <Button
                                        variant="outlined"
                                        color="success"
                                        startIcon={<MapTwoToneIcon />}
                                        onClick={() => {
                                            // Scroll or focus to map if needed
                                            const mapElement = document.getElementById('google-map-select');
                                            if (mapElement) {
                                                mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }
                                        }}
                                        style={{
                                            borderRadius: 15,
                                            textTransform: "none",
                                            fontWeight: "bold",
                                            fontSize: 15,
                                            padding: '8px 16px',
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        Select on Map
                                    </Button>
                                </Tooltip>
                            </Box>

                            {/* OR Divider */}
                            <Box display="flex" alignItems="center" justifyContent="center" mb={0.6}>
                                <Chip
                                    label="- OR -"
                                    color="success"
                                    sx={{
                                        color: "white",
                                        fontWeight: 'bold',
                                        fontSize: '0.8rem'
                                    }}
                                />
                            </Box>

                            {/* Google Maps Component */}
                            <Box sx={{
                                height: isDesktop ? '40px' : '40px', // Increased height for desktop
                                mb: error ? 0 : 1
                            }}>
                                <GoogleMaps
                                    onLocationSelect={onLocationSelect}
                                    setError={setError}
                                    fetchShops={fetchShops}
                                    handleClose={handleClose}
                                    setLocation={setLocation}
                                />
                            </Box>
                        </Box>

                        {/* Error Section */}
                        {error && (
                            <Box
                                sx={{
                                    p: 1,
                                    backgroundColor: '#fff3f3',
                                    borderRadius: 2,
                                    border: '1px solid #ffcccc',
                                    textAlign: 'center',
                                    mt: 1
                                }}
                            >
                                <img
                                    src="/image/searching_location.webp"
                                    alt="Error"
                                    style={{
                                        width: 165,
                                        height: 125,
                                    }}
                                    loading="eager"
                                    decoding="async"
                                />
                                <Typography variant="body2" color="error" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    OOPS!
                                </Typography>

                                <Typography variant="body2" color="error" gutterBottom>
                                    {error}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleClose}
                                    style={{
                                        borderRadius: 12,
                                        padding: '6px 20px',
                                        color: "white"
                                    }}
                                >
                                    OK
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default LocationDialog;
