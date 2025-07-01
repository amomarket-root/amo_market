import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const CancellationPolicy = () => {
    return (
        <Box sx={{ mt: 2, backgroundColor: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Cancellation Policy
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
            </Typography>
        </Box>
    );
};

export default CancellationPolicy;
