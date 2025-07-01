import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, Paper, Button, Grid,
    FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
    IconButton, LinearProgress, Tooltip, List, ListItem, ListItemText, MenuItem, Select, InputLabel
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShieldIcon from '@mui/icons-material/Shield';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import BuildIcon from '@mui/icons-material/Build';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ScheduleIcon from '@mui/icons-material/Schedule';
import axios from 'axios';
import CartButton from '../Cart/CartButton';
import LoginModal from '../Auth/LoginModal';
import { useSweetAlert } from '../Theme/SweetAlert';
import { useSnackbar } from '../Theme/SnackbarAlert';

const MobileRepair = ({ shopId, shopName, shopType }) => {
    const [serviceType, setServiceType] = useState('diagnostic');
    const [serviceLocation, setServiceLocation] = useState('center');
    const [serviceTime, setServiceTime] = useState('anytime');
    const [deviceType, setDeviceType] = useState('smartphone');
    const [totalAmount, setTotalAmount] = useState(0);
    const [deviceCount, setDeviceCount] = useState(1);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [cartVisible, setCartVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;
    const showAlert = useSweetAlert();
    const showSnackbar = useSnackbar();

    const servicePrices = {
        diagnostic: {
            price: 300,
            details: [
                'Complete device inspection',
                'Problem identification',
                'Detailed diagnosis report',
                'No repair work included',
                'Estimated time: 30-60 mins'
            ]
        },
        screen: {
            price: 1500,
            details: [
                'Screen replacement',
                'LCD/Digitizer repair',
                'Glass replacement',
                'Quality replacement parts',
                'Estimated time: 1-2 hours'
            ]
        },
        battery: {
            price: 1200,
            details: [
                'Battery replacement',
                'Battery health check',
                'Performance optimization',
                'Genuine/OEM batteries',
                'Estimated time: 45-90 mins'
            ]
        },
        software: {
            price: 500,
            details: [
                'OS reinstallation',
                'Software troubleshooting',
                'Virus/malware removal',
                'Data backup available',
                'Estimated time: 1-2 hours'
            ]
        },
        charging: {
            price: 800,
            details: [
                'Charging port repair',
                'Battery connector check',
                'Circuit board inspection',
                'Water damage assessment',
                'Estimated time: 1-2 hours'
            ]
        },
        water: {
            price: 2000,
            details: [
                'Liquid damage repair',
                'Corrosion cleaning',
                'Component replacement',
                'Data recovery attempt',
                'Estimated time: 2-4 hours'
            ]
        },
        camera: {
            price: 1000,
            details: [
                'Camera module replacement',
                'Lens cleaning',
                'Software calibration',
                'Focus issues repair',
                'Estimated time: 1-2 hours'
            ]
        }
    };

    const devicePrices = {
        smartphone: {
            price: 0,
            label: 'Smartphone'
        },
        tablet: {
            price: 500,
            label: 'Tablet'
        },
        foldable: {
            price: 1000,
            label: 'Foldable Phone'
        }
    };

    const locationPrices = {
        center: {
            price: 0,
            label: 'Service Center'
        },
        home: {
            price: 600,
            label: 'Home Service'
        }
    };

    const timeSlots = [
        { value: 'anytime', label: 'Anytime', duration: 'Varies' },
        { value: 'morning', label: 'Morning (9AM-12PM)', duration: '1-3 hours' },
        { value: 'afternoon', label: 'Afternoon (12PM-4PM)', duration: '1-3 hours' },
        { value: 'evening', label: 'Evening (4PM-8PM)', duration: '1-3 hours' },
        { value: 'express', label: 'Express Service', duration: '30-60 mins', extra: 400 }
    ];

    useEffect(() => {
        calculateTotal();
    }, [serviceType, serviceLocation, deviceCount, serviceTime, deviceType]);

    const calculateTotal = () => {
        const basePrice = servicePrices[serviceType]?.price || 0;
        const locationPrice = locationPrices[serviceLocation]?.price || 0;
        const devicePrice = devicePrices[deviceType]?.price || 0;
        const timeSlot = timeSlots.find(slot => slot.value === serviceTime);
        const timePrice = timeSlot?.extra || 0;
        setTotalAmount((basePrice + locationPrice + devicePrice + timePrice) * deviceCount);
    };

    const handleServiceChange = (event) => {
        setServiceType(event.target.value);
    };

    const handleLocationChange = (event) => {
        setServiceLocation(event.target.value);
    };

    const handleTimeChange = (event) => {
        setServiceTime(event.target.value);
    };

    const handleDeviceTypeChange = (event) => {
        setDeviceType(event.target.value);
    };

    const handleIncreaseDeviceCount = () => {
        setDeviceCount(prev => prev + 1);
    };

    const handleDecreaseDeviceCount = () => {
        if (deviceCount > 1) {
            setDeviceCount(prev => prev - 1);
        }
    };

    const handleBookService = async () => {
        const portal_token = localStorage.getItem('portal_token');
        if (!portal_token) {
            setLoginModalOpen(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const selectedTimeSlot = timeSlots.find(slot => slot.value === serviceTime);

            const formData = new FormData();
            const serviceData = {
                shop_id: shopId,
                service_type: serviceType,
                shop_name: shopName,
                shop_type: shopType,
                service_location: serviceLocation,
                service_time: serviceTime,
                service_time_label: selectedTimeSlot.label,
                service_duration: selectedTimeSlot.duration,
                device_type: deviceType,
                device_count: deviceCount,
                total_amount: totalAmount
            };

            formData.append('service_data', JSON.stringify(serviceData));
            formData.append('files[]', new Blob(), '');

            const response = await axios.post(`${apiUrl}/portal/cart/add`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${portal_token}`
                }
            });

            if (response.data.status) {
                showSnackbar(response.data.message, { severity: 'success' }, 2000);
                window.dispatchEvent(new Event('cartChange'));
                setCartVisible(true);
            } else {
                showAlert({
                    title: "Error!",
                    icon: "error",
                    text: response.data.message,
                    showConfirmButton: true,
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add service to cart';

            showAlert({
                title: "Warning!",
                icon: "warning",
                text: errorMessage,
                showConfirmButton: true,
                confirmButtonText: "OK",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const ServiceTooltip = ({ serviceType }) => {
        return (
            <Tooltip
                title={
                    <List dense>
                        {servicePrices[serviceType]?.details.map((item, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={item} />
                            </ListItem>
                        ))}
                    </List>
                }
                arrow
                placement="right"
            >
                <InfoIcon color="action" fontSize="small" />
            </Tooltip>
        );
    };

    const TimeSlotTooltip = ({ slot }) => (
        <Tooltip title={`Duration: ${slot.duration}${slot.extra ? ` (+₹${slot.extra})` : ''}`}>
            <InfoIcon color="action" fontSize="small" sx={{ ml: 1 }} />
        </Tooltip>
    );

    return (
        <Container sx={{ maxWidth: '100%', padding: '0px', mt: 0 }} maxWidth={false}>
            {cartVisible && <CartButton />}
            <Box sx={{ padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', ml: -3 }}>
                <IconButton onClick={() => window.history.back()}>
                    <ArrowBackIcon fontSize="large" color="#9F63FF" />
                </IconButton>
                <Typography variant="h5" sx={{ color: "#646363" }} fontWeight="bold">
                    Back
                </Typography>
            </Box>
            <Typography
                variant="h4"
                gutterBottom
                align="center"
                sx={{ fontWeight: 'bold', mb: '30px' }}
            >
                {shopName}
            </Typography>

            <Grid container spacing={2} alignItems="center" justifyContent="center">
                <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
                    <Box display="flex" justifyContent="center" alignItems="center" width="100%">
                        <img
                            src="/image/mobile_repair_illustration.png"
                            alt="Mobile Repair Illustration"
                            style={{ maxWidth: '100%', height: 'auto' }}
                            loading="eager"
                            decoding="async"
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <Paper
                        elevation={5}
                        sx={{ p: 3, borderRadius: 2, backgroundColor: '#f4f4fb', mb: 2 }}
                    >
                        <Box display="flex" flexDirection="column" alignItems="start">
                            <Box display="flex" alignItems="center" mb={2}>
                                <SmartphoneIcon sx={{ fontSize: 40, color: '#6c63ff', mr: 2 }} />
                                <Typography variant="h5" fontWeight="bold">
                                    Select Your Mobile Repair Service
                                </Typography>
                            </Box>

                            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                                <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    Service Type
                                </FormLabel>
                                <RadioGroup value={serviceType} onChange={handleServiceChange}>
                                    {Object.entries(servicePrices).map(([key, value]) => (
                                        <FormControlLabel
                                            key={key}
                                            value={key}
                                            control={<Radio />}
                                            label={
                                                <Box display="flex" alignItems="center">
                                                    {value.label || `${key.charAt(0).toUpperCase() + key.slice(1)} (₹${value.price})`}
                                                    <ServiceTooltip serviceType={key} />
                                                </Box>
                                            }
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>

                            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                                <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    Service Location
                                </FormLabel>
                                <RadioGroup row value={serviceLocation} onChange={handleLocationChange}>
                                    {Object.entries(locationPrices).map(([key, value]) => (
                                        <FormControlLabel
                                            key={key}
                                            value={key}
                                            control={<Radio />}
                                            label={
                                                <Box display="flex" alignItems="center">
                                                    {key === 'center' ? <BuildIcon sx={{ mr: 1 }} /> : <HomeIcon sx={{ mr: 1 }} />}
                                                    {value.label}
                                                    {value.price > 0 && ` (+₹${value.price})`}
                                                </Box>
                                            }
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel id="device-type-label">Device Type</InputLabel>
                                <Select
                                    labelId="device-type-label"
                                    value={deviceType}
                                    label="Device Type"
                                    onChange={handleDeviceTypeChange}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <SmartphoneIcon color="primary" />
                                        </InputAdornment>
                                    }
                                >
                                    {Object.entries(devicePrices).map(([key, value]) => (
                                        <MenuItem key={key} value={key}>
                                            {value.price > 0
                                                ? `${value.label} (+₹${value.price})`
                                                : value.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel id="service-time-label">Service Time</InputLabel>
                                <Select
                                    labelId="service-time-label"
                                    value={serviceTime}
                                    label="Service Time"
                                    onChange={handleTimeChange}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <ScheduleIcon color="primary" />
                                        </InputAdornment>
                                    }
                                >
                                    {timeSlots.map((slot) => (
                                        <MenuItem key={slot.value} value={slot.value}>
                                            <Box display="flex" alignItems="center">
                                                {slot.label}
                                                <TimeSlotTooltip slot={slot} />
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Box sx={{
                                width: '100%',
                                mb: 2,
                                p: 1,
                                backgroundColor: '#f0f0f0',
                                borderRadius: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Box>
                                    <Typography variant="body1" fontWeight="bold">
                                        Service: {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        Location: {locationPrices[serviceLocation]?.label || serviceLocation}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        Device: {devicePrices[deviceType]?.label || deviceType}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        Time: {timeSlots.find(slot => slot.value === serviceTime)?.label}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        Total Amount: ₹{totalAmount}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body1" fontWeight="bold" sx={{ mr: 1 }}>
                                        Devices:
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: '#10d915',
                                        borderRadius: '4px',
                                        padding: '2px 4px',
                                        color: 'white'
                                    }}>
                                        <IconButton
                                            size="small"
                                            onClick={handleDecreaseDeviceCount}
                                            sx={{ color: 'white', padding: '4px' }}
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                        <Typography variant="body2" component="div" sx={{ margin: '0 8px', color: 'white' }}>
                                            {deviceCount}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={handleIncreaseDeviceCount}
                                            sx={{ color: 'white', padding: '4px' }}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Box>

                            {isSubmitting && (
                                <Box sx={{ width: '100%', mb: 2 }}>
                                    <LinearProgress />
                                </Box>
                            )}

                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ width: '100%', py: 1.5, color: 'white' }}
                                onClick={handleBookService}
                                startIcon={<ShoppingCartIcon />}
                                disabled={isSubmitting}
                            >
                                Book Service
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Why choose our mobile repair service? Section */}
            <Box
                sx={{
                    backgroundColor: '#eceffd',
                    py: 6,
                    px: 2,
                    mt: 4,
                    borderRadius: 2,
                }}
            >
                <Typography
                    variant="h5"
                    align="center"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ mb: 4 }}
                >
                    Why choose our mobile repair service?
                </Typography>

                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                textAlign: 'center',
                                backgroundColor: 'white',
                            }}
                        >
                            <AccessTimeIcon sx={{ fontSize: 40, color: '#6c63ff', mb: 1 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Quick Service
                            </Typography>
                            <Typography variant="body2">
                                Most repairs completed within 2 hours
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                textAlign: 'center',
                                backgroundColor: 'white',
                            }}
                        >
                            <ShieldIcon sx={{ fontSize: 40, color: '#6c63ff', mb: 1 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Certified Technicians
                            </Typography>
                            <Typography variant="body2">
                                All repairs performed by certified professionals
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                textAlign: 'center',
                                backgroundColor: 'white',
                            }}
                        >
                            <BuildIcon sx={{ fontSize: 40, color: '#6c63ff', mb: 1 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Quality Parts
                            </Typography>
                            <Typography variant="body2">
                                We use only high-quality replacement parts
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                textAlign: 'center',
                                backgroundColor: 'white',
                            }}
                        >
                            <HomeIcon sx={{ fontSize: 40, color: '#6c63ff', mb: 1 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Home Service
                            </Typography>
                            <Typography variant="body2">
                                Convenient at-home repair service available
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* How Mobile Repair Works Section */}
            <Box
                sx={{
                    py: 6,
                    px: 2,
                    mt: 6,
                    backgroundColor: '#f0f2fc',
                    borderRadius: 2,
                }}
            >
                <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
                    How Mobile Repair works
                </Typography>
                <Typography variant="subtitle1" align="center" mb={4}>
                    Professional mobile repair at your convenience
                </Typography>

                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                            <SmartphoneIcon sx={{ fontSize: 50, color: '#6c63ff', mb: 2 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Select Service
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Choose the type of repair needed
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                            <HomeIcon sx={{ fontSize: 50, color: '#6c63ff', mb: 2 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Choose Location
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Select service center or home service
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                            <ScheduleIcon sx={{ fontSize: 50, color: '#6c63ff', mb: 2 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Pick Time Slot
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Select preferred time for service
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                            <ShoppingCartIcon sx={{ fontSize: 50, color: '#6c63ff', mb: 2 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Checkout
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Book service and complete payment
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
        </Container>
    );
};

export default MobileRepair;
