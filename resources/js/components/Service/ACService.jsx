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
import AcUnitIcon from '@mui/icons-material/AcUnit';
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

const ACService = ({ shopId, shopName, shopType }) => {
    const [serviceType, setServiceType] = useState('general');
    const [serviceLocation, setServiceLocation] = useState('home');
    const [serviceTime, setServiceTime] = useState('anytime');
    const [acType, setAcType] = useState('split');
    const [acTon, setAcTon] = useState('1.5');
    const [totalAmount, setTotalAmount] = useState(0);
    const [unitCount, setUnitCount] = useState(1);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [cartVisible, setCartVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;
    const showAlert = useSweetAlert();
    const showSnackbar = useSnackbar();

    const servicePrices = {
        general: {
            price: 600,
            details: [
                'Basic AC servicing',
                'Filter cleaning',
                'Outdoor unit check',
                'Cooling performance test',
                'Estimated time: 1-2 hours'
            ]
        },
        deep: {
            price: 1200,
            details: [
                'Complete AC servicing',
                'Chemical coil cleaning',
                'Drain pipe cleaning',
                'Full performance check',
                'Estimated time: 2-3 hours'
            ]
        },
        gas: {
            price: 1500,
            details: [
                'Gas refilling',
                'Leak detection',
                'Pressure testing',
                'Performance optimization',
                'Estimated time: 2-4 hours'
            ]
        },
        repair: {
            price: 2000,
            details: [
                'AC repair service',
                'Component replacement',
                'Electrical checks',
                'Cooling system repair',
                'Estimated time: 3-5 hours'
            ]
        },
        installation: {
            price: 2500,
            details: [
                'New AC installation',
                'Mounting bracket setup',
                'Copper piping',
                'Electrical connections',
                'Estimated time: 4-6 hours'
            ]
        },
        uninstallation: {
            price: 1800,
            details: [
                'AC removal service',
                'Gas recovery',
                'Safe dismantling',
                'Transport preparation',
                'Estimated time: 2-3 hours'
            ]
        },
        copper: {
            price: 3000,
            details: [
                'Copper pipe replacement',
                'New piping installation',
                'Pressure testing',
                'Insulation wrapping',
                'Estimated time: 3-5 hours'
            ]
        }
    };

    const acTypePrices = {
        window: {
            price: 0,
            label: 'Window AC'
        },
        split: {
            price: 200,
            label: 'Split AC'
        },
        cassette: {
            price: 500,
            label: 'Cassette AC'
        },
        tower: {
            price: 800,
            label: 'Tower AC'
        }
    };

    const acTonPrices = {
        '1': {
            price: 0,
            label: '1 Ton'
        },
        '1.5': {
            price: 300,
            label: '1.5 Ton'
        },
        '2': {
            price: 600,
            label: '2 Ton'
        },
        '2.5': {
            price: 900,
            label: '2.5 Ton'
        },
        '3': {
            price: 1200,
            label: '3 Ton'
        }
    };

    const locationPrices = {
        center: 0,
        home: 0 // No extra charge for home service as it's the default for ACs
    };

    const timeSlots = [
        { value: 'anytime', label: 'Anytime', duration: 'Varies' },
        { value: 'morning', label: 'Morning (8AM-12PM)', duration: '2-4 hours' },
        { value: 'afternoon', label: 'Afternoon (12PM-4PM)', duration: '2-4 hours' },
        { value: 'evening', label: 'Evening (4PM-8PM)', duration: '2-4 hours' },
        { value: 'express', label: 'Express Service', duration: '1-2 hours', extra: 500 }
    ];

    useEffect(() => {
        calculateTotal();
    }, [serviceType, serviceLocation, unitCount, serviceTime, acType, acTon]);

    const calculateTotal = () => {
        const basePrice = servicePrices[serviceType]?.price || 0;
        const locationPrice = locationPrices[serviceLocation] || 0;
        const typePrice = acTypePrices[acType]?.price || 0;
        const tonPrice = acTonPrices[acTon]?.price || 0;
        const timeSlot = timeSlots.find(slot => slot.value === serviceTime);
        const timePrice = timeSlot?.extra || 0;
        setTotalAmount((basePrice + locationPrice + typePrice + tonPrice + timePrice) * unitCount);
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

    const handleAcTypeChange = (event) => {
        setAcType(event.target.value);
    };

    const handleAcTonChange = (event) => {
        setAcTon(event.target.value);
    };

    const handleIncreaseUnitCount = () => {
        setUnitCount(prev => prev + 1);
    };

    const handleDecreaseUnitCount = () => {
        if (unitCount > 1) {
            setUnitCount(prev => prev - 1);
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
                ac_type: acType,
                ac_ton: acTon,
                unit_count: unitCount,
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
                            src="/image/ac_service_illustration.png"
                            alt="AC Service Illustration"
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
                                <AcUnitIcon sx={{ fontSize: 40, color: '#6c63ff', mr: 2 }} />
                                <Typography variant="h5" fontWeight="bold">
                                    Select Your AC Service
                                </Typography>
                            </Box>

                            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                                <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    Service Type
                                </FormLabel>
                                <RadioGroup value={serviceType} onChange={handleServiceChange}>
                                    <FormControlLabel
                                        value="general"
                                        control={<Radio />}
                                        label={
                                            <Box display="flex" alignItems="center">
                                                General Servicing (₹{servicePrices.general.price})
                                                <ServiceTooltip serviceType="general" />
                                            </Box>
                                        }
                                    />
                                    <FormControlLabel
                                        value="deep"
                                        control={<Radio />}
                                        label={
                                            <Box display="flex" alignItems="center">
                                                Deep Cleaning (₹{servicePrices.deep.price})
                                                <ServiceTooltip serviceType="deep" />
                                            </Box>
                                        }
                                    />
                                    <FormControlLabel
                                        value="gas"
                                        control={<Radio />}
                                        label={
                                            <Box display="flex" alignItems="center">
                                                Gas Refill (₹{servicePrices.gas.price})
                                                <ServiceTooltip serviceType="gas" />
                                            </Box>
                                        }
                                    />
                                    <FormControlLabel
                                        value="repair"
                                        control={<Radio />}
                                        label={
                                            <Box display="flex" alignItems="center">
                                                Repair Service (₹{servicePrices.repair.price})
                                                <ServiceTooltip serviceType="repair" />
                                            </Box>
                                        }
                                    />
                                    <FormControlLabel
                                        value="installation"
                                        control={<Radio />}
                                        label={
                                            <Box display="flex" alignItems="center">
                                                New Installation (₹{servicePrices.installation.price})
                                                <ServiceTooltip serviceType="installation" />
                                            </Box>
                                        }
                                    />
                                    <FormControlLabel
                                        value="uninstallation"
                                        control={<Radio />}
                                        label={
                                            <Box display="flex" alignItems="center">
                                                Uninstallation (₹{servicePrices.uninstallation.price})
                                                <ServiceTooltip serviceType="uninstallation" />
                                            </Box>
                                        }
                                    />
                                    <FormControlLabel
                                        value="copper"
                                        control={<Radio />}
                                        label={
                                            <Box display="flex" alignItems="center">
                                                Copper Pipe Work (₹{servicePrices.copper.price})
                                                <ServiceTooltip serviceType="copper" />
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </FormControl>

                            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                                <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    Service Location
                                </FormLabel>
                                <RadioGroup row value={serviceLocation} onChange={handleLocationChange}>
                                    <FormControlLabel
                                        value="home"
                                        control={<Radio />}
                                        label={
                                            <Box display="flex" alignItems="center">
                                                <HomeIcon sx={{ mr: 1 }} />
                                                Home Service
                                            </Box>
                                        }
                                    />
                                    <FormControlLabel
                                        value="center"
                                        control={<Radio />}
                                        label={
                                            <Box display="flex" alignItems="center">
                                                <BuildIcon sx={{ mr: 1 }} />
                                                Bring to Service Center
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel id="ac-type-label">AC Type</InputLabel>
                                <Select
                                    labelId="ac-type-label"
                                    value={acType}
                                    label="AC Type"
                                    onChange={handleAcTypeChange}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <AcUnitIcon color="primary" />
                                        </InputAdornment>
                                    }
                                >
                                    {Object.entries(acTypePrices).map(([key, value]) => (
                                        <MenuItem key={key} value={key}>
                                            {value.price > 0
                                                ? `${value.label} (+₹${value.price})`
                                                : value.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel id="ac-ton-label">AC Tonnage</InputLabel>
                                <Select
                                    labelId="ac-ton-label"
                                    value={acTon}
                                    label="AC Tonnage"
                                    onChange={handleAcTonChange}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <AcUnitIcon color="primary" />
                                        </InputAdornment>
                                    }
                                >
                                    {Object.entries(acTonPrices).map(([key, value]) => (
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
                                        Location: {serviceLocation === 'home' ? 'Home Service' : 'Service Center'}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        AC Type: {acTypePrices[acType]?.label || acType}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        Tonnage: {acTonPrices[acTon]?.label || acTon}
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
                                        Units:
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
                                            onClick={handleDecreaseUnitCount}
                                            sx={{ color: 'white', padding: '4px' }}
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                        <Typography variant="body2" component="div" sx={{ margin: '0 8px', color: 'white' }}>
                                            {unitCount}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={handleIncreaseUnitCount}
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

            {/* Why choose our AC service? Section */}
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
                    Why choose our AC service?
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
                                Most services completed same day
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
                                All services performed by certified professionals
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
                                We use only genuine replacement parts
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
                                Convenient at-home service available
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* How AC Service Works Section */}
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
                    How AC Service works
                </Typography>
                <Typography variant="subtitle1" align="center" mb={4}>
                    Professional AC service at your convenience
                </Typography>

                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                            <AcUnitIcon sx={{ fontSize: 50, color: '#6c63ff', mb: 2 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Select Service
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Choose the type of service needed
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

export default ACService;
