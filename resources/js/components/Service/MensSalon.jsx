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
import StorefrontIcon from '@mui/icons-material/Storefront';
import ContentCutIcon from '@mui/icons-material/ContentCut';
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

const MensSalon = ({ shopId, shopName, shopType }) => {
    const [serviceType, setServiceType] = useState('haircut');
    const [serviceLocation, setServiceLocation] = useState('salon');
    const [serviceTime, setServiceTime] = useState('anytime');
    const [hairLength, setHairLength] = useState('medium');
    const [totalAmount, setTotalAmount] = useState(0);
    const [personCount, setPersonCount] = useState(1);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [cartVisible, setCartVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;
    const showAlert = useSweetAlert();
    const showSnackbar = useSnackbar();

    const servicePrices = {
        haircut: {
            price: 500,
            details: [
                'Professional haircut',
                'Hair wash included',
                'Styling as per preference',
                'Neck shave (optional)',
                'Estimated time: 30-45 mins'
            ]
        },
        beard: {
            price: 300,
            details: [
                'Beard trimming & shaping',
                'Beard wash',
                'Hot towel treatment',
                'Beard oil application',
                'Estimated time: 20-30 mins'
            ]
        },
        haircut_beard: {
            price: 700,
            details: [
                'Complete haircut service',
                'Full beard grooming',
                'Hot towel treatment',
                'Hair & beard styling',
                'Estimated time: 45-60 mins'
            ]
        },
        facial: {
            price: 800,
            details: [
                'Deep cleansing',
                'Exfoliation',
                'Steam treatment',
                'Face mask',
                'Moisturizing',
                'Estimated time: 45 mins'
            ]
        },
        hair_color: {
            price: 1200,
            details: [
                'Professional hair coloring',
                'Consultation on shade',
                'Ammonia-free options',
                'Conditioning treatment',
                'Estimated time: 60-90 mins'
            ]
        },
        head_massage: {
            price: 600,
            details: [
                'Relaxing head massage',
                'Aromatherapy oils',
                'Neck & shoulder massage',
                'Stress relief techniques',
                'Estimated time: 30 mins'
            ]
        },
        shave: {
            price: 250,
            details: [
                'Traditional hot towel shave',
                'Pre-shave oil',
                'Post-shave balm',
                'Face massage',
                'Estimated time: 20 mins'
            ]
        },
        keratin: {
            price: 2000,
            details: [
                'Keratin smoothing treatment',
                'Frizz control',
                'Professional application',
                'Lasts 2-3 months',
                'Estimated time: 90-120 mins'
            ]
        },
        spa: {
            price: 1500,
            details: [
                'Full hair spa treatment',
                'Deep conditioning',
                'Scalp massage',
                'Hair mask',
                'Estimated time: 60 mins'
            ]
        },
        waxing: {
            price: 400,
            details: [
                'Chest waxing',
                'Back waxing',
                'Arm waxing',
                'After-wax lotion',
                'Estimated time: 30-45 mins'
            ]
        }
    };

    const hairLengthPrices = {
        short: {
            price: 0,
            label: 'Short'
        },
        medium: {
            price: 100,
            label: 'Medium'
        },
        long: {
            price: 200,
            label: 'Long'
        }
    };

    const locationPrices = {
        salon: {
            price: 0,
            label: 'Salon Visit'
        },
        home: {
            price: 600,
            label: 'Home Service'
        }
    };

    const timeSlots = [
        { value: 'anytime', label: 'Anytime', duration: 'Varies' },
        { value: 'morning', label: 'Morning (9AM-12PM)', duration: '30-60 mins' },
        { value: 'afternoon', label: 'Afternoon (12PM-4PM)', duration: '30-60 mins' },
        { value: 'evening', label: 'Evening (4PM-8PM)', duration: '30-60 mins' },
        { value: 'express', label: 'Express Service', duration: '15-30 mins', extra: 300 }
    ];

    useEffect(() => {
        calculateTotal();
    }, [serviceType, serviceLocation, personCount, serviceTime, hairLength]);

    const calculateTotal = () => {
        const basePrice = servicePrices[serviceType]?.price || 0;
        const locationPrice = locationPrices[serviceLocation]?.price || 0;
        const lengthPrice = hairLengthPrices[hairLength]?.price || 0;
        const timeSlot = timeSlots.find(slot => slot.value === serviceTime);
        const timePrice = timeSlot?.extra || 0;
        setTotalAmount((basePrice + locationPrice + lengthPrice + timePrice) * personCount);
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

    const handleHairLengthChange = (event) => {
        setHairLength(event.target.value);
    };

    const handleIncreasePersonCount = () => {
        setPersonCount(prev => prev + 1);
    };

    const handleDecreasePersonCount = () => {
        if (personCount > 1) {
            setPersonCount(prev => prev - 1);
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
                hair_length: hairLength,
                person_count: personCount,
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
                            src="/image/mens_salon_illustration.png"
                            alt="Men's Salon Illustration"
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
                                <ContentCutIcon sx={{ fontSize: 40, color: '#6c63ff', mr: 2 }} />
                                <Typography variant="h5" fontWeight="bold">
                                    Select Your Service
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
                                                    {key === 'haircut_beard' ? 'Haircut + Beard' :
                                                        key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')} (₹{value.price})
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
                                                    {key === 'salon' ? <StorefrontIcon sx={{ mr: 1 }} /> : <HomeIcon sx={{ mr: 1 }} />}
                                                    {value.label}
                                                    {value.price > 0 && ` (+₹${value.price})`}
                                                </Box>
                                            }
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel id="hair-length-label">Hair Length</InputLabel>
                                <Select
                                    labelId="hair-length-label"
                                    value={hairLength}
                                    label="Hair Length"
                                    onChange={handleHairLengthChange}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <ContentCutIcon color="primary" />
                                        </InputAdornment>
                                    }
                                >
                                    {Object.entries(hairLengthPrices).map(([key, value]) => (
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
                                        Service: {serviceType === 'haircut_beard' ? 'Haircut + Beard' :
                                            serviceType.charAt(0).toUpperCase() + serviceType.slice(1).replace('_', ' ')}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        Location: {locationPrices[serviceLocation]?.label || serviceLocation}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        Hair Length: {hairLengthPrices[hairLength]?.label || hairLength}
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
                                        Persons:
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
                                            onClick={handleDecreasePersonCount}
                                            sx={{ color: 'white', padding: '4px' }}
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                        <Typography variant="body2" component="div" sx={{ margin: '0 8px', color: 'white' }}>
                                            {personCount}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={handleIncreasePersonCount}
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

            {/* Why choose our salon? Section */}
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
                    Why choose our salon?
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
                                Most services completed within 30-60 mins
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
                                Certified Barbers
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
                            <ContentCutIcon sx={{ fontSize: 40, color: '#6c63ff', mb: 1 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Premium Products
                            </Typography>
                            <Typography variant="body2">
                                We use only high-quality grooming products
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

            {/* How Salon Service Works Section */}
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
                    How Salon Service works
                </Typography>
                <Typography variant="subtitle1" align="center" mb={4}>
                    Professional grooming services at your convenience
                </Typography>

                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                            <ContentCutIcon sx={{ fontSize: 50, color: '#6c63ff', mb: 2 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Select Service
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Choose from our range of grooming services
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
                                Select salon visit or home service
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

export default MensSalon;
