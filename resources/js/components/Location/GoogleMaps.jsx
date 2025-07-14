import React, { useContext, useEffect, useRef, useMemo } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import parse from 'autosuggest-highlight/parse';
import { debounce } from '@mui/material/utils';
import { LocationContext } from './LocationContext';
import useGoogleMaps from './GoogleMapsLoader';

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
    const autocompleteService = useRef(null);
    const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const { isLoaded: googleMapsLoaded, loadError } = useGoogleMaps(googleApiKey);

    useEffect(() => {
        if (googleMapsLoaded && window.google) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
    }, [googleMapsLoaded]);

    const fetch = useMemo(
        () =>
            debounce(
                (request, callback) => {
                    if (autocompleteService.current) {
                        autocompleteService.current.getPlacePredictions(
                            { ...request, componentRestrictions: { country: 'in' } },
                            callback
                        );
                    }
                },
                400
            ),
        []
    );

    useEffect(() => {
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
        if (!window.google?.maps) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: selectedLocation.description }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const { lat, lng } = results[0].geometry.location;
                const latitude = lat();
                const longitude = lng();

                if (isNaN(latitude) || isNaN(longitude)) {
                    console.error("Invalid latitude or longitude:", latitude, longitude);
                    setError("Invalid location. Please select a different location.");
                    updateLocation(latitude, longitude, selectedLocation.description);
                    return;
                }

                fetchShops(latitude, longitude).then((success) => {
                    if (success) {
                        updateLocation(latitude, longitude, selectedLocation.description);
                        onLocationSelect(selectedLocation);
                        handleClose();
                        setLocation(selectedLocation.description);
                    } else {
                        setError('Service is not available at this location. Please select a different location.');
                        updateLocation(latitude, longitude, selectedLocation.description);
                    }
                });
            } else {
                console.error('Geocoding failed:', status);
                setError('Geocoding failed: ' + status);
            }
        });
    };

    if (loadError) {
        return <Typography color="error">Error loading Google Maps</Typography>;
    }

    if (!googleMapsLoaded) {
        return <Skeleton variant="rectangular" width={340} height={56} />;
    }

    return (
        <Autocomplete
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
                const { key, ...otherProps } = props; // Extract key from props
                const matches = option.structured_formatting.main_text_matched_substrings || [];
                const parts = parse(
                    option.structured_formatting.main_text,
                    matches.map((match) => [match.offset, match.offset + match.length]),
                );

                return (
                    <li key={key} {...otherProps}>
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

export default GoogleMaps;
