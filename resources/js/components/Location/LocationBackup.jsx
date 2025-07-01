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

const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
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
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`
                    );
                    if (!response.ok) {
                        throw new Error("Failed to fetch address");
                    }
                    const data = await response.json();
                    if (data.results && data.results.length > 0) {
                        const formattedAddress = data.results[0].formatted_address;
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
    }, [updateLocation]); // Add only necessary dependencies

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

const GoogleMaps = ({
    onLocationSelect,
    setError,
    fetchShops,
    handleClose,
    setLocation,
}) => {
    const { updateLocation } = useContext(LocationContext);
    const [value, setValue] = React.useState(null);
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState([]);
    const loaded = React.useRef(false);

    if (typeof window !== 'undefined' && !loaded.current) {
      if (!document.querySelector('#google-maps')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
        script.async = true;
        script.id = 'google-maps';
        document.head.appendChild(script);
      }
      loaded.current = true;
    }

    const fetch = React.useMemo(
        () =>
            debounce(
                (request, callback) => {
                    if (window.google && window.google.maps && window.google.maps.places) {
                        const service = new window.google.maps.places.AutocompleteService();
                        service.getPlacePredictions(request, callback);
                    }
                },
                400,
            ),
        [],
    );

    React.useEffect(() => {
        let active = true;

        if (inputValue === '') {
            setOptions(value ? [value] : []);
            return undefined;
        }

        fetch({ input: inputValue }, (results) => {
            if (active) {
                let newOptions = [];

                if (value) {
                    newOptions = [value];
                }

                if (results) {
                    newOptions = [...newOptions, ...results];
                }

                setOptions(newOptions);
            }
        });

        return () => {
            active = false;
        };
    }, [value, inputValue, fetch]);

    const handleLocationSelect = (selectedLocation) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: selectedLocation.description }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const { lat, lng } = results[0].geometry.location;
                const latitude = lat();
                const longitude = lng();

                if (isNaN(latitude) || isNaN(longitude)) {
                    console.error("Invalid latitude or longitude:", latitude, longitude);
                    setError("Invalid location. Please select a different location.");
                    updateLocation(latitude, longitude, selectedLocation.description); // Update context even on error
                    return;
                }

                fetchShops(latitude, longitude).then((success) => {
                    if (success) {
                        updateLocation(latitude, longitude, selectedLocation.description);
                        onLocationSelect(selectedLocation);
                        handleClose();
                        setLocation(selectedLocation.description);
                    } else {
                        setError('Amo Market service is not available at this location at the moment. Please select a different location.');
                        updateLocation(latitude, longitude, selectedLocation.description); // Update context even on error
                    }
                });
            } else {
                console.error('Geocoding failed:', status);
                setError('Geocoding failed: ' + status);
            }
        });
    };

    return (
        <Autocomplete
            sx={{ width: 340 }}
            size="small"
            getOptionLabel={(option) =>
                typeof option === 'string' ? option : option.description
            }
            filterOptions={(x) => x}
            options={options}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={value}
            noOptionsText="No locations found"
            onChange={(event, newValue) => {
                setOptions(newValue ? [newValue, ...options] : options);
                setValue(newValue);
                if (newValue) {
                    handleLocationSelect(newValue);
                }
            }}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            renderInput={(params) => (
                <TextField {...params} label="Search Delivery location" fullWidth />
            )}
            renderOption={(props, option) => {
                const matches = option.structured_formatting.main_text_matched_substrings || [];
                const parts = parse(
                    option.structured_formatting.main_text,
                    matches.map((match) => [match.offset, match.offset + match.length]),
                );

                // Extract the key prop from props
                const { key, ...restProps } = props;

                return (
                    <li key={key} {...restProps}>
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
                                    {option.structured_formatting.secondary_text}
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
