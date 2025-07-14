import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { GoogleMap, Marker } from '@react-google-maps/api';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce } from '@mui/material/utils';
import MyLocationTwoToneIcon from '@mui/icons-material/MyLocationTwoTone';
import Skeleton from '@mui/material/Skeleton';
import { LocationContext } from './LocationContext';
import useGoogleMaps from './GoogleMapsLoader';

const containerStyle = {
    width: '100%',
    height: '100%',
};

const center = {
    lat: parseFloat(localStorage.getItem('latitude')) || 12.9716,
    lng: parseFloat(localStorage.getItem('longitude')) || 77.5946,
};

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const GoogleMapModel = ({ open, onClose, onConfirm }) => {
    const { updateLocation } = useContext(LocationContext);
    const [mapCenter, setMapCenter] = useState(center);
    const [selectedLocation, setSelectedLocation] = useState(center);
    const [locationName, setLocationName] = useState('');
    const [options, setOptions] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const mapRef = useRef(null);
    const autocompleteService = useRef(null);
    const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const { isLoaded: googleMapsLoaded, loadError } = useGoogleMaps(googleApiKey);

    useEffect(() => {
        if (open) {
            setMapCenter(center);
            setSelectedLocation(center);
            setLocationName('');
            setIsMapLoaded(false);
        }
    }, [open]);

    useEffect(() => {
        if (googleMapsLoaded && window.google) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
    }, [googleMapsLoaded]);

    const geocodeLatLng = useCallback((lat, lng) => {
        if (!window.google || !window.google.maps) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                setLocationName(results[0].formatted_address);
            } else {
                setLocationName('Location details not available');
            }
        });
    }, []);

    const handleMapLoad = useCallback((map) => {
        mapRef.current = map;
        setIsMapLoaded(true);
        geocodeLatLng(center.lat, center.lng);
    }, [geocodeLatLng]);

    const handleMapClick = useCallback((event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setSelectedLocation({ lat, lng });
        geocodeLatLng(lat, lng);
    }, [geocodeLatLng]);

    const handleMarkerDragEnd = useCallback((event) => {
        setIsDragging(false);
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setSelectedLocation({ lat, lng });
        geocodeLatLng(lat, lng);
    }, [geocodeLatLng]);

    const handleMarkerDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    const handleCurrentLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setMapCenter({ lat, lng });
                    setSelectedLocation({ lat, lng });
                    if (mapRef.current) mapRef.current.panTo({ lat, lng });
                    geocodeLatLng(lat, lng);
                },
                () => setLocationName("Could not get current location")
            );
        } else {
            setLocationName("Geolocation is not supported");
        }
    }, [geocodeLatLng]);

    const handleInputChange = useCallback(
        debounce((event, newInputValue) => {
            if (!autocompleteService.current || !newInputValue) return;

            autocompleteService.current.getPlacePredictions(
                { input: newInputValue, componentRestrictions: { country: 'in' } },
                (results, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                        setOptions(results || []);
                    }
                }
            );
        }, 400),
        []
    );

    const handleAutocompleteChange = useCallback((event, newValue) => {
        if (!newValue?.place_id || !window.google || !window.google.maps) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ placeId: newValue.place_id }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const newLocation = { lat: location.lat(), lng: location.lng() };

                setSelectedLocation(newLocation);
                setMapCenter(newLocation);
                if (mapRef.current) mapRef.current.panTo(newLocation);
                setLocationName(results[0].formatted_address);
            }
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (!window.google || !window.google.maps) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: selectedLocation }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const locationData = {
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                    fullAddress: locationName,
                };

                updateLocation(
                    selectedLocation.lat,
                    selectedLocation.lng,
                    locationName,
                );

                onConfirm(locationData);
                onClose();
            }
        });
    }, [selectedLocation, locationName, onConfirm, onClose, updateLocation]);

    if (loadError) {
        return (
            <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
                <Typography color="error" sx={{ p: 2 }}>
                    Error loading Google Maps
                </Typography>
            </Dialog>
        );
    }

    if (!googleMapsLoaded) {
        return (
            <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
                <Box sx={{ p: 2 }}>
                    <Skeleton variant="rectangular" width="100%" height={400} />
                    <Skeleton variant="text" width="100%" height={50} />
                    <Skeleton variant="text" width="100%" height={50} />
                </Box>
            </Dialog>
        );
    }

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            PaperProps={{
                sx: {
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            <AppBar position="static" elevation={0}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={onClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Select Location
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 1 }}>
                <Autocomplete
                    fullWidth
                    size='small'
                    options={options}
                    getOptionLabel={(option) => option.description}
                    onInputChange={handleInputChange}
                    onChange={handleAutocompleteChange}
                    noOptionsText="No locations found"
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Search for an address"
                            variant="outlined"
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                />
            </Box>

            <Box sx={{ flexGrow: 1, px: 1, pb: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flexGrow: 1, borderRadius: 4, overflow: 'hidden' }}>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={mapCenter}
                        zoom={15}
                        onClick={handleMapClick}
                        onLoad={handleMapLoad}
                        options={{
                            disableDefaultUI: true,
                            zoomControl: true,
                            gestureHandling: 'greedy',
                            clickableIcons: false,
                        }}
                    >
                        {selectedLocation && isMapLoaded && (
                            <Marker
                                position={selectedLocation}
                                draggable={true}
                                onDragEnd={handleMarkerDragEnd}
                                onDragStart={handleMarkerDragStart}
                                icon={{
                                    url: "/image/location_pin.webp",
                                    scaledSize: new window.google.maps.Size(60, 60),
                                    anchor: new window.google.maps.Point(30, 60)
                                }}
                            />
                        )}
                    </GoogleMap>
                </Box>

                <Box
                    sx={{
                        mt: 1,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        gap: 2,
                    }}
                >
                    <Button
                        variant="outlined"
                        startIcon={<MyLocationTwoToneIcon />}
                        onClick={handleCurrentLocation}
                        sx={{
                            flex: 1,
                            borderRadius: 5,
                            backgroundColor: '#e0d8ee',
                            color: '#5a1bcc',
                            borderColor: '#5a1bcc',
                            '&:hover': {
                                backgroundColor: '#e0e0e0',
                                borderColor: '#5a1bcc',
                            },
                        }}
                    >
                        Current Location
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleConfirm}
                        disabled={!locationName}
                        sx={{
                            flex: 1,
                            borderRadius: 5,
                            backgroundColor: 'success.main',
                            '&:hover': {
                                backgroundColor: 'success.dark',
                            },
                        }}
                    >
                        Confirm Location
                    </Button>
                </Box>

                <Box
                    sx={{
                        mt: 1,
                        border: '1px solid #ccc',
                        borderRadius: 2,
                        p: 2,
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f9f9f9',
                    }}
                >
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon color="primary" />
                        {locationName || 'Select a location on the map'}
                    </Typography>
                </Box>
            </Box>
        </Dialog>
    );
};

export default GoogleMapModel;
