import React, { useState, useEffect, useRef } from "react";
import { GoogleMap } from "@react-google-maps/api"; // Removed Marker
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import parse from 'autosuggest-highlight/parse';
import { debounce } from '@mui/material/utils';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import MyLocationTwoToneIcon from '@mui/icons-material/MyLocationTwoTone';

const Map = ({ onLocationSelect }) => {
  const autocompleteService = useRef(null);
  const [options, setOptions] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [selectedLocation, setSelectedLocation] = useState({ lat: 0, lng: 0 });
  const [locationName, setLocationName] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        const pos = { lat, lng };
        setMapCenter(pos);
        setSelectedLocation(pos);
      }
    );
  }, []);

  const fetch = React.useMemo(
    () =>
      debounce((request, callback) => {
        if (autocompleteService.current && window.google) {
          autocompleteService.current.getPlacePredictions(request, callback);
        }
      }, 400),
    []
  );

  const handleAutocompleteChange = (event, newValue) => {
    if (newValue && newValue.place_id) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: newValue.place_id }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          const address = results[0].formatted_address;

          setSelectedLocation({ lat, lng });
          setMapCenter({ lat, lng });
          setLocationName(address);

          // Call the callback function to pass the selected location data
          if (onLocationSelect) {
            onLocationSelect(address, lat, lng);
          }

          // Save to localStorage
          localStorage.setItem('latitude', lat);
          localStorage.setItem('longitude', lng);
        }
      });
    }
  };

  // Load Google Maps script
  const loadScript = (src, position, id) => {
    if (!position) return;
    const script = document.createElement('script');
    script.setAttribute('async', '');  // Ensures asynchronous loading
    script.setAttribute('defer', '');  // Ensures the script is executed after the HTML is parsed
    script.setAttribute('id', id);
    script.src = src;
    position.appendChild(script);
  };

  useEffect(() => {
    const onLoad = () => {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    };

    if (!window.google) {
      const script = document.querySelector('#google-maps');
      if (!script) {
        const position = document.querySelector('head');
        loadScript(
          `https://maps.googleapis.com/maps/api/js?key=AIzaSyA9MaTVJlWIWpINjcgyJl5eS6JDhe60238&libraries=places`,
          position,
          'google-maps'
        );
      } else {
        script.onload = onLoad;  // Ensure the onLoad is called if the script is already present
      }
    } else {
      onLoad();
    }
  }, []);

  const handleInputChange = (event, newInputValue) => {
    fetch({ input: newInputValue }, (results) => {
      if (results) {
        setOptions(results);
      } else {
        setOptions([]);
      }
    });
  };

  const geocodeLatLng = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setLocationName(results[0].formatted_address);
      } else {
        setLocationName('Unknown location');
      }
    });
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });
    geocodeLatLng(lat, lng);
    // Geocode the clicked location to get the address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        setLocationName(address);

        // Call the callback function to pass the selected location data
        if (onLocationSelect) {
          onLocationSelect(address, lat, lng);
        }

        // Save to localStorage
        localStorage.setItem('latitude', lat);
        localStorage.setItem('longitude', lng);
      }
    });
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMapCenter({ lat, lng });
        setSelectedLocation({ lat, lng });
        mapRef.current.panTo({ lat, lng });
        geocodeLatLng(lat, lng);
        // Geocode the current location to get the address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            setLocationName(address);

            // Call the callback function to pass the selected location data
            if (onLocationSelect) {
              onLocationSelect(address, lat, lng);
            }

            // Save to localStorage
            localStorage.setItem('latitude', lat);
            localStorage.setItem('longitude', lng);
          }
        });
      });
    }
  };

  return (
    <div>
      <Autocomplete
        id="google-map-demo"
        sx={{ width: "100%" }}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.description)}
        filterOptions={(x) => x}
        options={options}
        autoComplete
        includeInputInList
        filterSelectedOptions
        value={null}
        size="small"
        onChange={handleAutocompleteChange}
        onInputChange={handleInputChange}
        renderInput={(params) => (
          <TextField {...params} label="Search location" fullWidth />
        )}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          const matches = option.structured_formatting.main_text_matched_substrings || [];
          const parts = parse(option.structured_formatting.main_text, matches.map((match) => [match.offset, match.offset + match.length]));

          return (
            <li key={key} {...optionProps}>
              <Grid container alignItems="center">
                <Grid item sx={{ display: 'flex', width: 44 }}>
                  <LocationOnIcon sx={{ color: 'text.secondary' }} />
                </Grid>
                <Grid item xs>
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
      <div style={{ height: '550px', width: "100%" }}>
        <GoogleMap
          center={mapCenter}
          zoom={10}
          onLoad={(map) => (mapRef.current = map)}
          onClick={handleMapClick}
          mapContainerStyle={{ height: "100%", width: "100%" }}
        >
          {selectedLocation && (
            <div>
              <PushPinRoundedIcon
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '45px',
                  color: '#d32f2f',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '14px',
                  color: '#d32f2f',
                  fontWeight: 'bold',
                }}
              >
                {/* {`Latitude: ${selectedLocation.lat}, Longitude: ${selectedLocation.lng}`} */}
              </div>
            </div>
          )}
        </GoogleMap>
      </div>
      {/* Current Location Button */}
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
          choose current location
        </Button>
      </Box>

      {/* Delivery Location Information */}
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
            alignItems: 'center', // Center the icon and text vertically
            justifyContent: 'center', // Center the entire content horizontally
          }}
        >
          {/* Box for vertical stacking of text */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant="subtitle1">
              <LocationOnIcon color="primary" /> {locationName ? `${locationName}` : 'Location Is Searching...'}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {`Latitude: ${selectedLocation.lat}, Longitude: ${selectedLocation.lng}`}
            </Typography>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default Map;
