import React from 'react';
import { Box, Typography, Checkbox, Avatar } from '@mui/material';

const IndiaArmedForceContribution = ({ indiaArmedForceContribution, setIndiaArmedForceContribution }) => {
    return (
        <Box sx={{
            mt: 2,
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            {/* Avatar Section */}
            <Box sx={{ mr: 1, flexShrink: 0 }}>
                <Avatar
                    alt="India Armed Forces"
                    src="/image/india_armed_forces.png" // Replace with actual image path
                    sx={{ width: 50, height: 50 }}
                />
            </Box>

            {/* Content Section */}
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '16px' }}>
                    India Army contribution ₹1
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Support the defenders of the nation, and help India grow stronger...read more
                </Typography>
            </Box>

            {/* Checkbox Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <Checkbox
                    color="primary"
                    checked={indiaArmedForceContribution === 1}
                    onChange={(e) => setIndiaArmedForceContribution(e.target.checked ? 1 : 0)}
                />
                <Typography variant="body2" sx={{ ml: 1 }}>₹{indiaArmedForceContribution}</Typography>
            </Box>
        </Box>
    );
};

export default IndiaArmedForceContribution;
