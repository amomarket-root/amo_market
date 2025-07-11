import React, { useState } from 'react';
import {
    Paper,
    Box,
    Typography,
    IconButton,
    Chip,
    useTheme,
    useMediaQuery,
    Stack
} from '@mui/material';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';

const getStatusChipStyles = (status) => {
    switch (status) {
        case 'pending':
            return {
                bg: '#FFF3CD',
                color: '#856404',
                label: 'Pending',
            };
        case 'accepted':
            return {
                bg: '#D1ECF1',
                color: '#0C5460',
                label: 'Accepted',
            };
        case 'preparing':
            return {
                bg: '#CCE5FF',
                color: '#004085',
                label: 'Preparing',
            };
        case 'shipped':
            return {
                bg: '#E6F4EA',
                color: '#34A853',
                label: 'On the way',
            };
        case 'declined':
            return {
                bg: '#F8D7DA',
                color: '#721C24',
                label: 'Declined',
            };
        default:
            return {
                bg: '#E2E3E5',
                color: '#6C757D',
                label: status,
            };
    }
};

const OrderStatusPaper = ({
    status = 'pending',
    title = 'Natural Ice Cream',
    imageSrc = 'https://via.placeholder.com/40',
    description = 'Your order is being processed.',
    mapRef
}) => {
    const [expanded, setExpanded] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const toggleMapSize = () => setExpanded(prev => !prev);
    const chip = getStatusChipStyles(status);

    return (
        <Paper
            elevation={5}
            sx={{
                width: '100%',
                maxWidth: 800,
                mx: 'auto',
                borderRadius: 4,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: expanded ? 'column' : 'row',
                height: expanded ? 500 : 180,
                transition: 'all 0.3s ease-in-out',
                position: 'relative',
                mb: 2,
            }}
        >
            {/* Content Box */}
            <Box
                sx={{
                    flex: expanded ? '0 0 30%' : 1,
                    width: expanded ? '100%' : '50%',
                    height: expanded ? '30%' : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    p: 2,
                    boxSizing: 'border-box',
                    transition: 'all 0.3s ease-in-out',
                }}
            >
                {/* Row 1: Image and Chip */}
                <Stack direction="row" alignItems="center" spacing={2} >
                    <img
                        src={imageSrc}
                        alt={status}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            objectFit: 'cover',
                        }}
                    />
                    <Chip
                        label={chip.label}
                        sx={{
                            backgroundColor: chip.bg,
                            color: chip.color,
                            fontWeight: 500,
                            borderRadius: '8px',
                            height: 25,
                            fontSize: 14,
                            px: 1.5,
                            width: 'fit-content',
                        }}
                        size="small"
                    />
                </Stack>

                {/* Row 2: Title */}
                <Typography variant="h6" fontWeight="bold" color="success.dark" mb={0.5}>
                    {title}
                </Typography>

                {/* Row 3: Description */}
                <Typography variant="body1" fontWeight={500}>
                    {description}
                </Typography>
            </Box>

            {/* Map Section */}
            <Box
                sx={{
                    flex: expanded ? '0 0 70%' : 1,
                    width: expanded ? '100%' : '50%',
                    height: expanded ? '70%' : '100%',
                    position: 'relative',
                    transition: 'all 0.3s ease-in-out',
                    backgroundColor: '#f0f0f0',
                    overflow: 'hidden',
                    borderRadius: expanded ? 3 : 0,
                }}
            >
                {/* Toggle Button */}
                <IconButton
                    onClick={toggleMapSize}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: '#fff',
                        zIndex: 10,
                        boxShadow: 1,
                        '&:hover': {
                            backgroundColor: '#f0f0f0',
                        }
                    }}
                >
                    {expanded ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
                </IconButton>

                {/* Google Map */}
                <Box
                    ref={mapRef}
                    sx={{
                        width: '100%',
                        height: '100%',
                        transition: 'transform 0.5s ease',
                        transform: expanded ? 'scale(1.05)' : 'scale(1)',
                        borderRadius: expanded ? 3 : 0,
                        overflow: 'hidden',
                    }}
                />
            </Box>
        </Paper>
    );
};

export default OrderStatusPaper;
