import React, { useState, useEffect, useRef, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce } from '@mui/material/utils';
import MyLocationTwoToneIcon from '@mui/icons-material/MyLocationTwoTone';
import Skeleton from '@mui/material/Skeleton';
import useGoogleMaps from '../Location/GoogleMapsLoader';

const containerStyle = {
    width: '100%',
    height: '610px',
    borderRadius: '10px',
};

const center = {
    lat: parseFloat(localStorage.getItem('latitude')) || 12.9716,
    lng: parseFloat(localStorage.getItem('longitude')) || 77.5946,
};

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
});

const MapAddressModel = ({ open, onClose, onConfirm }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [mapCenter, setMapCenter] = useState(center);
    const [selectedLocation, setSelectedLocation] = useState(center);
    const [locationName, setLocationName] = useState('');
    const [options, setOptions] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const mapRef = useRef(null);
    const autocompleteService = useRef(null);
    const placesService = useRef(null);
    const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const { isLoaded: googleMapsLoaded, loadError } = useGoogleMaps(googleApiKey);

    // Initialize services when Google Maps is loaded
    useEffect(() => {
        if (googleMapsLoaded && window.google && window.google.maps) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
            placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
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

    const handleMapClick = useCallback((event) => {
        if (!event.latLng) return;
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

                    if (mapRef.current) {
                        mapRef.current.panTo({ lat, lng });
                    }

                    geocodeLatLng(lat, lng);
                },
                (error) => {
                    console.error("Error getting current location:", error);
                    setLocationName("Could not get current location");
                }
            );
        } else {
            setLocationName("Geolocation is not supported by this browser");
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
        [googleMapsLoaded]
    );

    const handleAutocompleteChange = useCallback((event, newValue) => {
        if (!newValue || !newValue.place_id || !window.google?.maps) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ placeId: newValue.place_id }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const newLocation = { lat: location.lat(), lng: location.lng() };

                setSelectedLocation(newLocation);
                setMapCenter(newLocation);

                if (mapRef.current) {
                    mapRef.current.panTo(newLocation);
                }

                setLocationName(results[0].formatted_address);
            }
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (!window.google?.maps) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: selectedLocation }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const addressComponents = results[0].address_components;

                const state = addressComponents.find((component) =>
                    component.types.includes('administrative_area_level_1')
                )?.long_name;

                const city = addressComponents.find((component) =>
                    component.types.includes('locality')
                )?.long_name;

                const pin_code = addressComponents.find((component) =>
                    component.types.includes('postal_code')
                )?.long_name;

                onConfirm({
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                    fullAddress: locationName,
                    state: state || '',
                    city: city || '',
                    pin_code: pin_code || '',
                });
            } else {
                onConfirm({
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                    fullAddress: locationName,
                    state: '',
                    city: '',
                    pin_code: '',
                });
            }
        });
    }, [selectedLocation, locationName, onConfirm]);

    if (loadError) {
        return (
            <Dialog open={open} onClose={onClose}>
                <Box p={3}>
                    <Typography color="error">Error loading Google Maps: {loadError.message}</Typography>
                    <Button onClick={onClose}>Close</Button>
                </Box>
            </Dialog>
        );
    }

    return (
        <Dialog
            fullScreen={isMobile}
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            keepMounted
            sx={
                !isMobile
                    ? {
                        '& .MuiDialog-paper': {
                            position: 'fixed',
                            right: 0,
                            margin: 0,
                            width: '30%',
                            height: '100vh',
                            maxHeight: '100vh',
                        },
                    }
                    : {}
            }
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <AppBar sx={{ position: 'sticky', top: 0, backgroundColor: '#fff', color: 'black' }}>
                    <Toolbar>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
                            Confirm map pin location
                        </Typography>
                        <IconButton edge="start" color="inherit" onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>

                <Box sx={{ paddingLeft: 2, paddingRight: 2, marginTop: 1 }}>
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

                {!googleMapsLoaded ? (
                    <Box sx={{ paddingLeft: 2, paddingRight: 2, height: '520px', marginTop: 1 }}>
                        <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
                    </Box>
                ) : (
                    <Box sx={{ paddingLeft: 2, paddingRight: 2, height: '520px', marginTop: 1 }}>
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={mapCenter}
                            zoom={15}
                            onClick={handleMapClick}
                            onLoad={(map) => {
                                mapRef.current = map;
                                if (window.google && !autocompleteService.current) {
                                    autocompleteService.current = new window.google.maps.places.AutocompleteService();
                                }
                            }}
                            options={{
                                disableDefaultUI: true,
                                zoomControl: true,
                                gestureHandling: 'greedy', // Changed this line to fix the scroll/zoom issue
                                clickableIcons: false,
                            }}
                        >
                            {selectedLocation && (
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
                )}

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<MyLocationTwoToneIcon />}
                        onClick={handleCurrentLocation}
                        sx={{
                            backgroundColor: '#e0d8ee',
                            color: '#5a1bcc',
                            borderColor: '#5a1bcc',
                            '&:hover': {
                                backgroundColor: '#e0e0e0',
                                borderColor: '#5a1bcc',
                            },
                        }}
                    >
                        Go to current location
                    </Button>
                </Box>

                <Box
                    sx={{
                        mt: 3,
                        p: 2,
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Delivering your order to
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle1">
                                <LocationOnIcon color="primary" /> {locationName || 'Location Is Searching...'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        position: 'sticky',
                        bottom: 0,
                        backgroundColor: '#fff',
                        padding: '16px',
                        borderTopLeftRadius: '10px',
                        borderTopRightRadius: '10px',
                        boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }}
                >
                    <Button
                        variant="contained"
                        sx={{
                            width: '100%',
                            padding: '10px 0',
                            borderRadius: '25px',
                            backgroundColor: 'success.main',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                                borderColor: 'primary.dark',
                            }
                        }}
                        onClick={handleConfirm}
                    >
                        Confirm location & proceed
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

export default MapAddressModel;
