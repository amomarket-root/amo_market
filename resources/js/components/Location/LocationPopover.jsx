import React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import GoogleMaps from './GoogleMaps';

const LocationPopover = ({
    anchorEl,
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
    // Only render the Popover if anchorEl is valid
    if (!anchorEl) {
        return null;
    }

    return (
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "center",
            }}
            PaperProps={{
                style: {
                    borderRadius: 20,
                    width: 340,
                    padding: "20px 20px",
                    height: error ? 'auto' : 'auto'
                },
            }}
        >
            <Typography variant="h6" style={{ fontWeight: "bold", fontSize: 17, paddingBottom: "15px" }}>
                Welcome to <span style={{ color: '#2EDF0F' }}>Amo</span> <span style={{ color: '#7528FA' }}>Market</span>
            </Typography>
            <Box display="flex" alignItems="center">
                <LocationOnIcon style={{ fontSize: "40px", marginRight: "8px", color: "#757575" }} />
                <Typography variant="body2" gutterBottom>
                    Please provide your delivery location to view products available at nearby shops or stores.
                </Typography>
            </Box>
            <Divider sx={{ flexGrow: 1, margin: 1 }} />
            <Tooltip title="Use Current Location">
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<LocationOnIcon />}
                    onClick={handleCurrentLocationClick}
                    style={{
                        borderRadius: 15,
                        textTransform: "none",
                        fontWeight: "bold",
                        fontSize: 15,
                        marginBottom: 5,
                        width: "100%",
                    }}
                >
                    {loading ? <CircularProgress size={24} /> : "Current Location"}
                </Button>
            </Tooltip>
            <Box display="flex" alignItems="center" justifyContent="center">
                <Chip label="- OR -" size="small" sx={{ margin: 1 }} />
            </Box>
            <Tooltip title="Search Delivery Location">
                <span>
                    <GoogleMaps
                        onLocationSelect={onLocationSelect}
                        setError={setError}
                        fetchShops={fetchShops}
                        handleClose={handleClose}
                        setLocation={setLocation}
                    />
                </span>
            </Tooltip>
            {error && (
                <Box
                    sx={{
                        mt: 1,
                        p: 1,
                        backgroundColor: '#fff3f3',
                        borderRadius: 2,
                        border: '1px solid #ffcccc',
                        textAlign: 'center',
                    }}
                >
                    <img
                        src="/image/searching_location.webp"
                        alt="Error"
                        style={{ width: 140, height: 130, marginBottom: 1 }}
                        loading="eager"
                        decoding="async"
                    />
                    <Typography variant="body2" color="error">
                        {error}
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleClose}
                        style={{ marginTop: 5 }}
                    >
                        OK
                    </Button>
                </Box>
            )}
        </Popover>
    );
};

export default LocationPopover;
