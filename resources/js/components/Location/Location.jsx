import React, { useState, useEffect, useCallback, useContext } from "react";
import { LocationContext } from './LocationContext';
import { IconButton } from '@mui/material';
import LocationButton from './LocationButton';
import LocationDialog from './LocationDialog';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import axios from 'axios';

const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
const apiUrl = import.meta.env.VITE_API_URL;

const Location = ({ onLocationSelect }) => {
    const { latitude, longitude, address, updateLocation } = useContext(LocationContext);
    const [location, setLocation] = useState(address || "");
    const [open, setOpen] = useState(false);
    const [currentAddress, setCurrentAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [error, setError] = useState(null);

    const fetchShops = async (latitude, longitude) => {
        try {
            if (latitude && longitude) {
                const response = await axios.get(`${apiUrl}/portal/shops?latitude=${latitude}&longitude=${longitude}`);
                if (response.data && response.data.data && response.data.data.length > 0) {
                    setError(null);
                    return true;
                } else {
                    setError("Amo Market service is not available at this location at the moment. Please select a different location.");
                    updateLocation(latitude, longitude);
                    return false;
                }
            } else {
                setError("Invalid location. Please select a different location.");
                return false;
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError("Amo Market service is not available at this location at the moment. Please select a different location.");
            } else {
                setError("Failed to fetch shops. Please try again.");
            }
            updateLocation(latitude, longitude);
            return false;
        }
    };

    const handleLocationSelect = useCallback((locationData) => {
        updateLocation(locationData.lat, locationData.lng, locationData.fullAddress);
        setLocation(locationData.fullAddress);
        if (onLocationSelect) {
            onLocationSelect(locationData);
        }
    }, [updateLocation, onLocationSelect]);

    const fetchGeocodeLocation = useCallback(async () => {
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
                        const success = await fetchShops(latitude, longitude);
                        if (success) {
                            updateLocation(latitude, longitude, formattedAddress);
                            setOpen(false);
                            setIsDropdownOpen(false);
                        } else {
                            setOpen(true);
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
                setOpen(false);
                setIsDropdownOpen(false);
            }
        );
    }, [updateLocation]);

    useEffect(() => {
        if (!latitude || !longitude) {
            fetchGeocodeLocation();
        } else {
            fetchShops(latitude, longitude);
            setLoading(false);
        }
    }, [latitude, longitude, fetchGeocodeLocation]);

    const handleClick = (event) => {
        setOpen(true);
        setIsDropdownOpen((prev) => !prev);
    };

    const handleClose = () => {
        setOpen(false);
        setIsDropdownOpen(false);
    };

    const handleCurrentLocationClick = () => {
        setLoading(true);
        setLocation("");
        fetchGeocodeLocation();
    };

    const truncate = (str, n) => {
        return str.length > n ? str.substr(0, n - 1) + " ..." : str;
    };

    return (
        <>
            <div style={{ display: "flex", alignItems: "center" }}>
                <LocationButton onClick={handleClick} />
                <LocationDialog
                    open={open}
                    onClose={handleClose}
                    loading={loading}
                    error={error}
                    handleCurrentLocationClick={handleCurrentLocationClick}
                    onLocationSelect={handleLocationSelect}
                    setError={setError}
                    fetchShops={fetchShops}
                    handleClose={handleClose}
                    setLocation={setLocation}
                />
                <div style={{ marginLeft: 10 }}>
                    <Typography variant="body1" noWrap style={{ fontWeight: "bold", marginTop: 10, color: "black" }}>
                        Delivery in 20 minutes
                    </Typography>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" noWrap style={{ color: "#212121" }}>
                            {loading ? (
                                <Skeleton width={200} />
                            ) : (
                                <Tooltip title={location || currentAddress || address || "Unable to fetch address"} arrow>
                                    <Typography component="span" variant="body2" noWrap style={{ color: "#212121" }}>
                                        {truncate(location || currentAddress || address || "Unable to fetch address", 30)}
                                    </Typography>
                                </Tooltip>
                            )}
                        </Typography>
                        <IconButton
                            onClick={handleClick}
                            size="small"
                            style={{
                                marginLeft: 8,
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                border: '1px solid #ccc',
                                backgroundColor: '#f5f5f5',
                            }}
                        >
                            {isDropdownOpen ? (
                                <ArrowDropUpIcon style={{ color: "#000", fontSize: 28 }} />
                            ) : (
                                <ArrowDropDownIcon style={{ color: "#000", fontSize: 28 }} />
                            )}
                        </IconButton>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Location;
