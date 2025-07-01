import React, { useState, useEffect, useCallback, useContext } from "react";
import { LocationContext } from './LocationContext'; // Import the context
import Popover from "@mui/material/Popover";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { Box, Chip, Divider, CircularProgress } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import parse from 'autosuggest-highlight/parse';
import { debounce } from '@mui/material/utils';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const Location = ({ onLocationSelect }) => {
    const { latitude, longitude, address, updateLocation } = useContext(LocationContext);
    const [location, setLocation] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentAddress, setCurrentAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [error, setError] = useState(null);

    const fetchShops = async (latitude, longitude) => {
        try {
            if (latitude && longitude) {
                console.log("Fetching shops for latitude:", latitude, "longitude:", longitude); // Debugging
                const response = await axios.get(`${apiUrl}/portal/shops?latitude=${latitude}&longitude=${longitude}`);
                console.log("Shops API response:", response.data); // Debugging

                if (response.data && response.data.data && response.data.data.length > 0) {
                    console.log("Shops data:", response.data.data);
                    setError(null); // Clear any previous error
                    return true; // Indicate success
                } else {
                    console.error("No shops data found in the response");
                    setError("Amo Market service is not available at this location at the moment. Please select a different location.");
                    updateLocation(latitude, longitude);
                    return false; // Indicate failure
                }
            } else {
                console.error('Latitude and Longitude not available');
                setError("Invalid location. Please select a different location.");
                return false; // Indicate failure
            }
        } catch (error) {
            console.error('Error fetching shops:', error);

            // Handle 404 errors specifically
            if (error.response && error.response.status === 404) {
                setError("Amo Market service is not available at this location at the moment. Please select a different location.");
            } else {
                setError("Failed to fetch shops. Please try again.");
            }
            updateLocation(latitude, longitude);
            return false; // Indicate failure
        }
    };


    const fetchGeocodeLocation = useCallback(async () => {
        console.log("fetchGeocodeLocation called"); // Debugging
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    if (!response.ok) {
                        throw new Error("Failed to fetch address");
                    }
                    const data = await response.json();
                    if (data.display_name) {
                        const formattedAddress = data.display_name;
                        setCurrentAddress(formattedAddress);
                        setLocation(formattedAddress);
                        const success = await fetchShops(latitude, longitude); // Call fetchShops here
                        if (success) {
                            updateLocation(latitude, longitude, formattedAddress); // Update context with address
                            setAnchorEl(null); // Close Popover on success
                            setIsDropdownOpen(false);
                        } else {
                            setAnchorEl(document.getElementById('location-button')); // Open Popover on error
                        }
                    } else {
                        setCurrentAddress("Unable to fetch address");
                    }
                } catch (error) {
                    console.error("Error fetching address:", error);
                    setCurrentAddress("Unable to fetch address");
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Error getting current location:", error);
                setLoading(false);
                setAnchorEl(null);
                setIsDropdownOpen(false);
            }
        );
    }, [updateLocation]); // Add only necessary dependencies here


    useEffect(() => {
        if (!latitude || !longitude) {
            // If latitude and longitude are not in localStorage, fetch the current location
            fetchGeocodeLocation();
        } else {
            // If latitude and longitude are in localStorage, fetch shops directly
            fetchShops(latitude, longitude);
            setLoading(false);
        }
    }, [latitude, longitude, fetchGeocodeLocation]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        setIsDropdownOpen((prev) => !prev);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setIsDropdownOpen(false);
    };

    const handleCurrentLocationClick = () => {
        setLoading(true);
        setLocation("");
        fetchGeocodeLocation();
    };


    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    const truncate = (str, n) => {
        return str.length > n ? str.substr(0, n - 1) + "..." : str;
    };

    return (
        <>
            <div style={{ display: "flex", alignItems: "center" }}>
                <Button id="location-button" onClick={handleClick} style={{ display: 'none' }}></Button>
                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "center",
                    }}
                    PaperProps={{
                        style: { borderRadius: 20, width: 340, padding: "20px 20px", height: error ? 'auto' : 'auto' },
                    }}
                >
                    <div>
                        <Typography
                            variant="h6"
                            style={{ fontWeight: "bold", fontSize: 17, paddingBottom: "15px" }}
                        >
                            Welcome to <span style={{ color: '#2EDF0F' }}>Amo</span> <span style={{ color: '#7528FA' }}>Market</span>
                        </Typography>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <LocationOnIcon style={{ fontSize: "40px", marginRight: "8px", color: "#757575" }} />
                        <Typography variant="body2" gutterBottom>
                            Please provide your delivery location to view products available at nearby shops or stores.
                        </Typography>
                    </div>
                    <Divider sx={{ flexGrow: 1, margin: 1 }} />
                    <div>
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
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Chip label="- OR -" size="small" sx={{ margin: 1 }} />
                        </Box>
                        <Tooltip title="Search Delivery Location">
                            <div>
                                <GoogleMaps
                                    onLocationSelect={(selectedLocation) => {
                                        setLocation(selectedLocation.description);
                                        onLocationSelect(selectedLocation);
                                    }}
                                    setError={setError}
                                    fetchShops={fetchShops}
                                    handleClose={handleClose}
                                    setLocation={setLocation}
                                />
                            </div>
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
                                <img src="/image/searching_location.gif" alt="Error" style={{ width: 140, height: 130, marginBottom: 1 }} />
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
                    </div>
                </Popover>
                <div style={{ marginLeft: 10 }}>
                    <Typography
                        variant="body1"
                        noWrap
                        style={{ fontWeight: "bold", marginTop: 10, color: "black" }}
                    >
                        Delivery in 20 minutes
                    </Typography>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" noWrap style={{ color: "#212121", marginRight: 8 }}>
                            {loading ? (
                                <Skeleton width={200} />
                            ) : (
                                <Tooltip
                                    title={location || currentAddress || address || "Unable to fetch address"}
                                    arrow
                                >
                                    <Typography variant="body2" noWrap style={{ color: "#212121", marginRight: 8 }}>
                                        {truncate(location || currentAddress || address || "Unable to fetch address", 30)}
                                    </Typography>
                                </Tooltip>
                            )}
                        </Typography>
                        {isDropdownOpen ? (
                            <ArrowDropUpIcon
                                style={{ color: "#000", cursor: "pointer", fontSize: 40 }}
                                onClick={handleClick}
                            />
                        ) : (
                            <ArrowDropDownIcon
                                style={{ color: "#000", cursor: "pointer", fontSize: 40 }}
                                onClick={handleClick}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};


const GoogleMaps = ({ onLocationSelect, setError, fetchShops, handleClose, setLocation }) => {
    const { updateLocation } = useContext(LocationContext);
    const [value, setValue] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);

    const fetchLocations = useCallback(
        debounce(async (query) => {
            if (!query) {
                setOptions([]);
                return;
            }
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
                );
                if (!response.ok) throw new Error('Failed to fetch locations');
                const data = await response.json();

                setOptions(
                    data.map((place) => ({
                        description: place.display_name,
                        lat: place.lat,
                        lon: place.lon,
                    }))
                );
            } catch (error) {
                console.error('Error fetching locations:', error);
                setError('Error fetching locations');
            }
        }, 400),
        []
    );

    useEffect(() => {
        fetchLocations(inputValue);
    }, [inputValue, fetchLocations]);

    const handleLocationSelect = (selectedLocation) => {
        if (!selectedLocation) return;
        const { lat, lon, description } = selectedLocation;

        if (isNaN(lat) || isNaN(lon)) {
            console.error('Invalid latitude or longitude:', lat, lon);
            setError('Invalid location. Please select a different location.');
            updateLocation(lat, lon, description); // Update context even on error
            return;
        }

        fetchShops(lat, lon).then((success) => {
            if (success) {
                updateLocation(lat, lon, description);
                onLocationSelect(selectedLocation);
                handleClose();
                setLocation(description);
            } else {
                setError('Service is not available at this location. Please select another.');
                updateLocation(lat, lon, description); // Update context even on error
            }
        });
    };

    return (
        <Autocomplete
            sx={{ width: 340 }}
            size="small"
            getOptionLabel={(option) => option.description}
            filterOptions={(x) => x}
            options={options}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={value}
            noOptionsText="No locations found"
            onChange={(event, newValue) => {
                setValue(newValue);
                if (newValue) {
                    handleLocationSelect(newValue);
                }
            }}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            renderInput={(params) => <TextField {...params} label="Search Delivery Location" fullWidth />}
            renderOption={(props, option) => {
                const matches = option.description.split(' ').map((word, i) => [i, i + word.length]);
                const parts = parse(option.description, matches);

                return (
                    <li {...props} key={option.description}>
                        <Grid container alignItems="center">
                            <Grid item sx={{ display: 'flex', width: 44 }}>
                                <LocationOnIcon sx={{ color: 'text.secondary' }} />
                            </Grid>
                            <Grid item sx={{ width: 'calc(100% - 44px)', wordWrap: 'break-word' }}>
                                {parts.map((part, index) => (
                                    <Box
                                        key={index}
                                        component="span"
                                        sx={{ fontWeight: part.highlight ? 'bold' : 'regular' }}
                                    >
                                        {part.text}
                                    </Box>
                                ))}
                                <Typography variant="body2" color="text.secondary">
                                    {option.description}
                                </Typography>
                            </Grid>
                        </Grid>
                    </li>
                );
            }}
        />
    );
};


export default Location;
