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
import KitchenIcon from '@mui/icons-material/Kitchen';
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

const HomeAppliance = ({ shopId, shopName, shopType }) => {
    const [serviceType, setServiceType] = useState('repair');
    const [serviceLocation, setServiceLocation] = useState('home');
    const [serviceTime, setServiceTime] = useState('anytime');
    const [applianceType, setApplianceType] = useState('refrigerator');
    const [applianceSize, setApplianceSize] = useState('medium');
    const [totalAmount, setTotalAmount] = useState(0);
    const [applianceCount, setApplianceCount] = useState(1);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [cartVisible, setCartVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;
    const showAlert = useSweetAlert();
    const showSnackbar = useSnackbar();

    const servicePrices = {
        repair: {
            price: 1200,
            label: 'Repair Service',
            details: [
                'General appliance repair',
                'Component replacement',
                'Electrical checks',
                'Performance testing',
                'Estimated time: 2-4 hours'
            ]
        },
        installation: {
            price: 800,
            label: 'Installation',
            details: [
                'New appliance installation',
                'Proper setup and alignment',
                'Safety checks',
                'Basic demonstration',
                'Estimated time: 1-3 hours'
            ]
        },
        uninstallation: {
            price: 600,
            label: 'Uninstallation',
            details: [
                'Appliance removal',
                'Safe disconnection',
                'Transport preparation',
                'Area cleanup',
                'Estimated time: 1-2 hours'
            ]
        },
        maintenance: {
            price: 900,
            label: 'Maintenance',
            details: [
                'Preventive maintenance',
                'Cleaning and lubrication',
                'Performance optimization',
                'Wear and tear inspection',
                'Estimated time: 2-3 hours'
            ]
        },
        deepclean: {
            price: 1500,
            label: 'Deep Cleaning',
            details: [
                'Deep cleaning service',
                'Sanitization',
                'Odor removal',
                'Interior/exterior cleaning',
                'Estimated time: 2-4 hours'
            ]
        },
        gasrefill: {
            price: 1800,
            label: 'Gas Refill',
            details: [
                'Gas refilling service',
                'Leak detection',
                'Pressure testing',
                'Cooling optimization',
                'Estimated time: 2-3 hours'
            ]
        },
        motorreplace: {
            price: 2000,
            label: 'Motor Replacement',
            details: [
                'Motor replacement',
                'New motor installation',
                'Performance testing',
                'Warranty on parts',
                'Estimated time: 3-5 hours'
            ]
        }
    };

    const appliancePrices = {
        refrigerator: {
            price: 0,
            label: 'Refrigerator'
        },
        washingmachine: {
            price: 300,
            label: 'Washing Machine'
        },
        microwave: {
            price: 200,
            label: 'Microwave'
        },
        dishwasher: {
            price: 400,
            label: 'Dishwasher'
        },
        oven: {
            price: 500,
            label: 'Oven'
        },
        chimney: {
            price: 600,
            label: 'Chimney'
        },
        mixer: {
            price: 100,
            label: 'Mixer/Grinder'
        }
    };

    const sizePrices = {
        small: {
            price: 0,
            label: 'Small (Compact)'
        },
        medium: {
            price: 300,
            label: 'Medium (Standard)'
        },
        large: {
            price: 600,
            label: 'Large'
        },
        xlarge: {
            price: 900,
            label: 'Extra Large'
        }
    };

    const locationPrices = {
        home: {
            price: 500,
            label: 'Home Service',
            icon: <HomeIcon sx={{ mr: 1 }} />
        },
        center: {
            price: 0,
            label: 'Bring to Service Center',
            icon: <BuildIcon sx={{ mr: 1 }} />
        }
    };

    const timeSlots = [
        { value: 'anytime', label: 'Anytime', duration: 'Varies' },
        { value: 'morning', label: 'Morning (8AM-12PM)', duration: '2-4 hours' },
        { value: 'afternoon', label: 'Afternoon (12PM-4PM)', duration: '2-4 hours' },
        { value: 'evening', label: 'Evening (4PM-8PM)', duration: '2-4 hours' },
        { value: 'express', label: 'Express Service', duration: '1-2 hours', extra: 400 }
    ];

    useEffect(() => {
        calculateTotal();
    }, [serviceType, serviceLocation, applianceCount, serviceTime, applianceType, applianceSize]);

    const calculateTotal = () => {
        const basePrice = servicePrices[serviceType]?.price || 0;
        const locationPrice = locationPrices[serviceLocation]?.price || 0;
        const appliancePrice = appliancePrices[applianceType]?.price || 0;
        const sizePrice = sizePrices[applianceSize]?.price || 0;
        const timeSlot = timeSlots.find(slot => slot.value === serviceTime);
        const timePrice = timeSlot?.extra || 0;
        setTotalAmount((basePrice + locationPrice + appliancePrice + sizePrice + timePrice) * applianceCount);
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

    const handleApplianceTypeChange = (event) => {
        setApplianceType(event.target.value);
    };

    const handleApplianceSizeChange = (event) => {
        setApplianceSize(event.target.value);
    };

    const handleIncreaseApplianceCount = () => {
        setApplianceCount(prev => prev + 1);
    };

    const handleDecreaseApplianceCount = () => {
        if (applianceCount > 1) {
            setApplianceCount(prev => prev - 1);
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
                appliance_type: applianceType,
                appliance_size: applianceSize,
                appliance_count: applianceCount,
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
                            src="/image/home_appliance_illustration.png"
                            alt="Home Appliance Service Illustration"
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
                                <KitchenIcon sx={{ fontSize: 40, color: '#6c63ff', mr: 2 }} />
                                <Typography variant="h5" fontWeight="bold">
                                    Select Your Appliance Service
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
                                                    {value.label} (₹{value.price})
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
                                                    {value.icon}
                                                    {value.label}
                                                    {value.price > 0 && ` (+₹${value.price})`}
                                                </Box>
                                            }
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel id="appliance-type-label">Appliance Type</InputLabel>
                                <Select
                                    labelId="appliance-type-label"
                                    value={applianceType}
                                    label="Appliance Type"
                                    onChange={handleApplianceTypeChange}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <KitchenIcon color="primary" />
                                        </InputAdornment>
                                    }
                                >
                                    {Object.entries(appliancePrices).map(([key, value]) => (
                                        <MenuItem key={key} value={key}>
                                            {value.price > 0
                                                ? `${value.label} (+₹${value.price})`
                                                : value.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel id="appliance-size-label">Appliance Size</InputLabel>
                                <Select
                                    labelId="appliance-size-label"
                                    value={applianceSize}
                                    label="Appliance Size"
                                    onChange={handleApplianceSizeChange}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <KitchenIcon color="primary" />
                                        </InputAdornment>
                                    }
                                >
                                    {Object.entries(sizePrices).map(([key, value]) => (
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
                                        Service: {servicePrices[serviceType]?.label || serviceType}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        Location: {locationPrices[serviceLocation]?.label || serviceLocation}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        Appliance: {appliancePrices[applianceType]?.label || applianceType}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        Size: {sizePrices[applianceSize]?.label || applianceSize}
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
                                        Appliances:
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
                                            onClick={handleDecreaseApplianceCount}
                                            sx={{ color: 'white', padding: '4px' }}
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                        <Typography variant="body2" component="div" sx={{ margin: '0 8px', color: 'white' }}>
                                            {applianceCount}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={handleIncreaseApplianceCount}
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

            {/* Why choose our appliance service? Section */}
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
                    Why choose our appliance service?
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

            {/* How Appliance Service Works Section */}
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
                    How Appliance Service works
                </Typography>
                <Typography variant="subtitle1" align="center" mb={4}>
                    Professional appliance service at your convenience
                </Typography>

                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                            <KitchenIcon sx={{ fontSize: 50, color: '#6c63ff', mb: 2 }} />
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

export default HomeAppliance;
