import React from 'react';
import Button from '@mui/material/Button';

const LocationButton = ({ onClick }) => {
    return (
        <Button id="location-button" onClick={onClick} style={{ display: 'none' }}>
            Location
        </Button>
    );
};

export default LocationButton;
