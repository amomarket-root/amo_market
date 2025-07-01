import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

const OrderStatusCard = ({ status, imageSrc, title, description, mapRef }) => {
    return (
        <Card sx={{ mb: 2, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)", borderRadius: 4, overflow: "hidden" }}>
            <CardContent>
                <Box display="flex" alignItems="center">
                    <img src={imageSrc} alt={status} style={{ width: "40px", height: "40px", marginRight: "8px" }} />
                    <Typography variant="h5" color="green" fontWeight="bold" gutterBottom>
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h6" gutterBottom>
                    {description}
                </Typography>
            </CardContent>
            <div ref={mapRef} style={{ height: "300px", width: "100%", borderRadius: "10px", margin: "8px" }}></div>
        </Card>
    );
};

export default OrderStatusCard;
