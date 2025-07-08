import React, { useState, useEffect, useRef, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';
import HomeWorkTwoToneIcon from '@mui/icons-material/HomeWorkTwoTone';
import OtherHousesTwoToneIcon from '@mui/icons-material/OtherHousesTwoTone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationTwoToneIcon from '@mui/icons-material/MyLocationTwoTone';
import { GoogleMap, Marker } from '@react-google-maps/api';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce } from '@mui/material/utils';
import axios from 'axios';
import Skeleton from '@mui/material/Skeleton';
import { InputAdornment } from '@mui/material';
import { useSnackbar } from '../Theme/SnackbarAlert';
import useGoogleMaps from '../Location/GoogleMapsLoader';

const center = {
    lat: parseFloat(localStorage.getItem('latitude')) || 12.9716,
    lng: parseFloat(localStorage.getItem('longitude')) || 77.5946,
};

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
});

const AddressAddModel = ({ open, onClose, addressToEdit }) => {
    const theme = useTheme();
    const apiUrl = import.meta.env.VITE_API_URL;
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isSmallLaptop = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isMediumLaptop = useMediaQuery(theme.breakpoints.between('md', 'lg'));
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

    // Responsive container style for Google Maps
    const containerStyle = {
        width: '100%',
        height: isMobile ? '250px' :
            isSmallLaptop ? '310px' :
                isMediumLaptop ? '350px' :
                    '310px',
        borderRadius: '10px',
    };

    const [showTextField, setShowTextField] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        alternative_number: '',
        pin_code: '',
        state: '',
        city: '',
        building_details: '',
        location: '',
        is_default: '0',
        address_type: 'home',
        delivery_note: '',
        status: 1,
        latitude: '',
        longitude: '',
        full_address: '',
    });
    const [loading, setLoading] = useState(false);
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
    const [validationErrors, setValidationErrors] = useState({});
    const showSnackbar = useSnackbar();

    // Validation rules
    const validateField = (name, value) => {
        switch (name) {
            case 'full_name':
                if (!value.trim()) return 'Full name is required';
                if (value.length < 3) return 'Full name must be at least 3 characters';
                return '';
            case 'phone_number':
                if (!value) return 'Phone number is required';
                if (!/^[6-9]\d{9}$/.test(value)) return 'Enter a valid 10-digit phone number';
                return '';
            case 'alternative_number':
                if (value && !/^[6-9]\d{9}$/.test(value)) return 'Enter a valid 10-digit phone number';
                return '';
            case 'pin_code':
                if (!value) return 'Pincode is required';
                if (!/^\d{6}$/.test(value)) return 'Enter a valid 6-digit pincode';
                return '';
            case 'state':
                if (!value.trim()) return 'State is required';
                return '';
            case 'city':
                if (!value.trim()) return 'City is required';
                return '';
            case 'building_details':
                if (!value.trim()) return 'Building details are required';
                return '';
            case 'location':
                if (!value.trim()) return 'Road/Area details are required';
                return '';
            default:
                return '';
        }
    };

    // Validate entire form
    const validateForm = () => {
        const errors = {};
        let isValid = true;

        // Validate required fields
        const requiredFields = [
            'full_name', 'phone_number', 'pin_code',
            'state', 'city', 'building_details', 'location'
        ];

        requiredFields.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                errors[field] = [error];
                isValid = false;
            }
        });

        // Validate alternative number if provided
        if (formData.alternative_number) {
            const error = validateField('alternative_number', formData.alternative_number);
            if (error) {
                errors.alternative_number = [error];
                isValid = false;
            }
        }

        // Validate location coordinates
        if (!formData.latitude || !formData.longitude) {
            errors.location = ['Please select delivery location on the map'];
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    // Clear validation errors for specific fields
    const clearValidationErrors = (fields) => {
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            fields.forEach(field => {
                delete newErrors[field];
            });
            return newErrors;
        });
    };

    // Initialize services when Google Maps is loaded
    useEffect(() => {
        if (googleMapsLoaded && window.google && window.google.maps) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
            placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
        }
    }, [googleMapsLoaded]);

    // Set form data when editing an address
    useEffect(() => {
        if (addressToEdit) {
            setLoading(true);
            setFormData(addressToEdit);
            if (addressToEdit.latitude && addressToEdit.longitude) {
                setMapCenter({
                    lat: parseFloat(addressToEdit.latitude),
                    lng: parseFloat(addressToEdit.longitude)
                });
                setSelectedLocation({
                    lat: parseFloat(addressToEdit.latitude),
                    lng: parseFloat(addressToEdit.longitude)
                });
                setLocationName(addressToEdit.full_address);
            }
            setLoading(false);
        } else {
            setFormData({
                full_name: '',
                phone_number: '',
                alternative_number: '',
                pin_code: '',
                state: '',
                city: '',
                building_details: '',
                location: '',
                is_default: '0',
                address_type: 'home',
                delivery_note: '',
                status: 1,
                latitude: '',
                longitude: '',
                full_address: '',
            });
            setMapCenter(center);
            setSelectedLocation(center);
            setLocationName('');
            setValidationErrors({});
        }
    }, [open, addressToEdit]);

    const handleButtonClick = () => {
        setShowTextField(!showTextField);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validate the field as user types
        const error = validateField(name, value);

        setValidationErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[name] = [error];
            } else {
                delete newErrors[name];
            }
            return newErrors;
        });

        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const geocodeLatLng = useCallback((lat, lng) => {
        if (!window.google || !window.google.maps) return;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                setLocationName(results[0].formatted_address);
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

                setFormData(prevData => ({
                    ...prevData,
                    latitude: lat,
                    longitude: lng,
                    full_address: results[0].formatted_address,
                    location: results[0].formatted_address,
                    state: state || '',
                    city: city || '',
                    pin_code: pin_code || '',
                }));

                // Clear validation errors for the updated fields
                clearValidationErrors(['location', 'state', 'city', 'pin_code']);
            } else {
                setLocationName('Unknown location');
                showSnackbar("Could not determine address for selected location", { severity: 'error' }, 2000);
            }
        });
    }, [showSnackbar]);

    const handleLocationConfirm = useCallback((locationData) => {
        const updatedFields = {
            latitude: locationData.lat,
            longitude: locationData.lng,
            full_address: locationData.fullAddress,
            location: locationData.fullAddress,
            state: locationData.state || '',
            city: locationData.city || '',
            pin_code: locationData.pin_code || '',
        };

        setFormData(prevData => ({
            ...prevData,
            ...updatedFields
        }));

        // Clear validation errors for the updated fields
        clearValidationErrors(['location', 'state', 'city', 'pin_code']);
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
                    showSnackbar("Could not get current location. Please select manually.", { severity: 'error' }, 2000);
                }
            );
        } else {
            setLocationName("Geolocation is not supported by this browser");
            showSnackbar("Geolocation is not supported by your browser.", { severity: 'error' }, 2000);
        }
    }, [geocodeLatLng, showSnackbar]);

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
                handleLocationConfirm({
                    lat: location.lat(),
                    lng: location.lng(),
                    fullAddress: results[0].formatted_address,
                    state: results[0].address_components.find((component) =>
                        component.types.includes('administrative_area_level_1')
                    )?.long_name || '',
                    city: results[0].address_components.find((component) =>
                        component.types.includes('locality')
                    )?.long_name || '',
                    pin_code: results[0].address_components.find((component) =>
                        component.types.includes('postal_code')
                    )?.long_name || '',
                });
            }
        });
    }, [handleLocationConfirm]);

    const handleSubmit = async () => {
        // First validate the form
        if (!validateForm()) {
            showSnackbar("Please fill in the mandatory fields before submitting.", { severity: 'error' }, 2000);
            return;
        }

        setLoading(true);

        try {
            const url = addressToEdit
                ? `${apiUrl}/portal/user/address/${addressToEdit.id}`
                : `${apiUrl}/portal/user/address/store_address_details`;

            const method = addressToEdit ? 'put' : 'post';

            const response = await axios[method](url, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('portal_token')}`,
                },
            });

            if (response.data.status) {
                showSnackbar(addressToEdit ? 'Address updated successfully' : 'Address stored successfully', { severity: 'success' }, 2000);
                onClose();
            } else {
                showSnackbar('Failed to store/update address: ' + response.data.message, { severity: 'error' }, 2000);
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setValidationErrors(error.response.data.errors);
                showSnackbar('Please fix the validation errors', { severity: 'error' }, 2000);
            } else {
                showSnackbar('An error occurred while storing/updating the address', { severity: 'error' }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

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
        <Box sx={{ width: '100%', maxWidth: 'none', height: '100%' }}>
            <Dialog
                fullScreen={isMobile}
                open={open}
                onClose={onClose}
                TransitionComponent={Transition}
                keepMounted
                sx={{
                    '& .MuiDialog-paper': {
                        width: '82%',
                        maxWidth: 'none',
                        height: '100vh',
                        margin: 0,
                        position: 'fixed',
                        right: 0,
                        maxHeight: 'none',
                    },
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                    {/* Map Section */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Box sx={{ paddingLeft: 2, paddingRight: 2, marginTop: 1 }}>
                            <Autocomplete
                                fullWidth
                                size='small'
                                options={options}
                                getOptionLabel={(option) => option.description}
                                onInputChange={handleInputChange}
                                noOptionsText="No locations found"
                                onChange={handleAutocompleteChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Search for an address"
                                        variant="outlined"
                                        error={!!validationErrors.location}
                                        helperText={validationErrors.location ? validationErrors.location[0] : ''}
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
                            <Box sx={{ paddingLeft: 1, paddingRight: 1, height: '450px', marginTop: 1 }}>
                                <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
                            </Box>
                        ) : (
                            <Box sx={{ paddingLeft: 1, paddingRight: 1, height: '450px', marginTop: 1 }}>
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
                                        gestureHandling: 'greedy',
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
                                                url: '/image/location_pin.webp',
                                                scaledSize: new window.google.maps.Size(50, 50),
                                                anchor: new window.google.maps.Point(25, 50)
                                            }}
                                        />
                                    )}
                                </GoogleMap>
                            </Box>
                        )}

                        <Box sx={{ textAlign: 'center', mt: 1 }}>
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
                                mt: 1,
                                p: 1,
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
                                        <LocationOnIcon color="primary" /> {locationName ? `${locationName}` : 'Location Is Searching...'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Divider orientation="vertical" flexItem />

                    {/* Address Form Section */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <Box
                            sx={{
                                flexGrow: 1,
                                overflowY: 'auto',
                                padding: '10px',
                                backgroundColor: '#fff',
                            }}
                        >
                            {loading ? (
                                <Grid container spacing={2}>
                                    {[...Array(10)].map((_, index) => (
                                        <Grid item xs={12} key={index}>
                                            <Skeleton variant="rectangular" height={40} />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Full Name (Required)"
                                            size='small'
                                            variant="outlined"
                                            name="full_name"
                                            value={formData.full_name || ''}
                                            onChange={handleChange}
                                            error={!!validationErrors.full_name}
                                            helperText={validationErrors.full_name ? validationErrors.full_name[0] : ''}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Phone Number (Required)"
                                            variant="outlined"
                                            size='small'
                                            type="tel"
                                            name="phone_number"
                                            value={formData.phone_number || ''}
                                            onChange={handleChange}
                                            error={!!validationErrors.phone_number}
                                            helperText={validationErrors.phone_number ? validationErrors.phone_number[0] : ''}
                                            InputProps={{
                                                startAdornment: <Typography variant="body1" style={{ marginRight: 8 }}>+91</Typography>
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Add Alternate Phone Number"
                                            variant="outlined"
                                            size='small'
                                            type="tel"
                                            name="alternative_number"
                                            value={formData.alternative_number || ''}
                                            onChange={handleChange}
                                            error={!!validationErrors.alternative_number}
                                            helperText={validationErrors.alternative_number ? validationErrors.alternative_number[0] : ''}
                                            InputProps={{
                                                startAdornment: <Typography variant="body1" style={{ marginRight: 8 }}>+91</Typography>
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Pincode (Required)"
                                            variant="outlined"
                                            size='small'
                                            name="pin_code"
                                            value={formData.pin_code || ''}
                                            onChange={handleChange}
                                            error={!!validationErrors.pin_code}
                                            helperText={validationErrors.pin_code ? validationErrors.pin_code[0] : ''}
                                        />
                                    </Grid>

                                    <Grid item xs={4}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="State"
                                            variant="outlined"
                                            name="state"
                                            size='small'
                                            value={formData.state || ''}
                                            onChange={handleChange}
                                            error={!!validationErrors.state}
                                            helperText={validationErrors.state ? validationErrors.state[0] : ''}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="City (Required)"
                                            variant="outlined"
                                            name="city"
                                            size='small'
                                            value={formData.city || ''}
                                            onChange={handleChange}
                                            error={!!validationErrors.city}
                                            helperText={validationErrors.city ? validationErrors.city[0] : ''}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="House No., Building Name (Required)"
                                            variant="outlined"
                                            name="building_details"
                                            size='small'
                                            value={formData.building_details || ''}
                                            onChange={handleChange}
                                            error={!!validationErrors.building_details}
                                            helperText={validationErrors.building_details ? validationErrors.building_details[0] : ''}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Road Name, Area, Colony (Required)"
                                            variant="outlined"
                                            name="location"
                                            size='small'
                                            value={formData.location || ''}
                                            onChange={handleChange}
                                            error={!!validationErrors.location}
                                            helperText={validationErrors.location ? validationErrors.location[0] : ''}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormLabel component="legend">Default Address ?</FormLabel>
                                        <RadioGroup
                                            row
                                            defaultValue="0"
                                            sx={{ mb: 1 }}
                                            name="is_default"
                                            value={formData.is_default || ''}
                                            onChange={handleChange}
                                        >
                                            <FormControlLabel
                                                value="1"
                                                control={<Radio />}
                                                label="Yes"
                                            />
                                            <FormControlLabel
                                                value="0"
                                                control={<Radio />}
                                                label="No"
                                            />
                                        </RadioGroup>
                                    </Grid>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Button
                                                variant="text"
                                                fullWidth
                                                sx={{
                                                    textTransform: 'none',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    marginLeft: 1,
                                                    textOverflow: 'ellipsis',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '8px',
                                                    padding: '8px 16px',
                                                    '&:hover': {
                                                        borderColor: '#999',
                                                    }
                                                }}
                                                onClick={handleButtonClick}
                                            >
                                                + Add Nearby Famous Landmark
                                            </Button>
                                        </Grid>
                                        {showTextField && (
                                            <Grid item xs={12} sx={{ marginLeft: 2 }}>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    label="Nearby Famous Landmark"
                                                    variant="outlined"
                                                    name="delivery_note"
                                                    size='small'
                                                    value={formData.delivery_note || ''}
                                                    onChange={handleChange}
                                                    error={!!validationErrors.delivery_note}
                                                    helperText={validationErrors.delivery_note ? validationErrors.delivery_note[0] : ''}
                                                />
                                            </Grid>
                                        )}
                                    </Grid>
                                </Grid>
                            )}
                        </Box>

                        <Box
                            sx={{
                                backgroundColor: '#fff',
                                padding: '5px',
                                borderTopLeftRadius: '10px',
                                borderTopRightRadius: '10px',
                                boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <FormLabel component="legend">Type of Address</FormLabel>
                            <RadioGroup
                                row
                                defaultValue="home"
                                name="address_type"
                                value={formData.address_type || ''}
                                onChange={handleChange}
                            >
                                <FormControlLabel
                                    value="home"
                                    control={<Radio />}
                                    label={<Box display="flex" alignItems="center"><HomeTwoToneIcon sx={{ mr: 0.1 }} /> Home</Box>}
                                />
                                <FormControlLabel
                                    value="work"
                                    control={<Radio />}
                                    label={<Box display="flex" alignItems="center"><HomeWorkTwoToneIcon sx={{ mr: 0.1 }} /> Work</Box>}
                                />
                                <FormControlLabel
                                    value="other"
                                    control={<Radio />}
                                    label={<Box display="flex" alignItems="center"><OtherHousesTwoToneIcon sx={{ mr: 0.1 }} /> Other</Box>}
                                />
                            </RadioGroup>
                            <Button
                                variant="contained"
                                fullWidth
                                sx={{
                                    width: '100%',
                                    padding: '3px 0',
                                    borderRadius: '25px',
                                    backgroundColor: 'green',
                                    '&:hover': {
                                        backgroundColor: '#5a1bcc',
                                    },
                                }}
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? <Skeleton variant="text" width="100%" /> : 'Save Address'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
};

export default AddressAddModel;