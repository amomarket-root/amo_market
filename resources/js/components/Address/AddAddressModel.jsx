import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';
import HomeWorkTwoToneIcon from '@mui/icons-material/HomeWorkTwoTone';
import OtherHousesTwoToneIcon from '@mui/icons-material/OtherHousesTwoTone';
import MyLocationTwoToneIcon from '@mui/icons-material/MyLocationTwoTone';
import MapAddressModel from './MapAddressModel';
import { CircularProgress } from '@mui/material';
import AddLocationAltTwoToneIcon from '@mui/icons-material/AddLocationAltTwoTone';
import axios from 'axios';
import Skeleton from '@mui/material/Skeleton';
import { useSnackbar } from '../Theme/SnackbarAlert';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
});

const AddAddressModel = ({ open, onClose, addressToEdit }) => {
    const theme = useTheme();
    const apiUrl = import.meta.env.VITE_API_URL;
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [showTextField, setShowTextField] = useState(false);
    const [openMapAddressModel, setOpenMapAddressModel] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        alternative_number: '',
        pin_code: '',
        state: '',
        city: '',
        building_details: '',
        location: '',
        is_default: '0',
        address_type: 'home',
        delivery_note: '',
        status: 1,
        latitude: '',
        longitude: '',
        full_address: '',
    });
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const showSnackbar = useSnackbar();

    // Validation rules
    const validateField = (name, value) => {
        switch (name) {
            case 'full_name':
                if (!value.trim()) return 'Full name is required';
                if (value.length < 3) return 'Full name must be at least 3 characters';
                return '';
            case 'phone_number':
                if (!value) return 'Phone number is required';
                if (!/^[6-9]\d{9}$/.test(value)) return 'Enter a valid 10-digit phone number';
                return '';
            case 'alternative_number':
                if (value && !/^[6-9]\d{9}$/.test(value)) return 'Enter a valid 10-digit phone number';
                return '';
            case 'pin_code':
                if (!value) return 'Pincode is required';
                if (!/^\d{6}$/.test(value)) return 'Enter a valid 6-digit pincode';
                return '';
            case 'state':
                if (!value.trim()) return 'State is required';
                return '';
            case 'city':
                if (!value.trim()) return 'City is required';
                return '';
            case 'building_details':
                if (!value.trim()) return 'Building details are required';
                return '';
            case 'location':
                if (!value.trim()) return 'Road/Area details are required';
                return '';
            default:
                return '';
        }
    };

    // Validate entire form
    const validateForm = () => {
        const errors = {};
        let isValid = true;

        // Validate required fields
        const requiredFields = [
            'full_name', 'phone_number', 'pin_code',
            'state', 'city', 'building_details', 'location'
        ];

        requiredFields.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                errors[field] = [error];
                isValid = false;
            }
        });

        // Validate alternative number if provided
        if (formData.alternative_number) {
            const error = validateField('alternative_number', formData.alternative_number);
            if (error) {
                errors.alternative_number = [error];
                isValid = false;
            }
        }

        // Validate location coordinates
        if (!formData.latitude || !formData.longitude) {
            errors.location = ['Please select delivery location on the map'];
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    // Clear validation errors for specific fields
    const clearValidationErrors = (fields) => {
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            fields.forEach(field => {
                delete newErrors[field];
            });
            return newErrors;
        });
    };

    useEffect(() => {
        if (addressToEdit) {
            setLoading(true);
            setFormData(addressToEdit);
            setLoading(false);
        } else {
            setFormData({
                full_name: '',
                phone_number: '',
                alternative_number: '',
                pin_code: '',
                state: '',
                city: '',
                building_details: '',
                location: '',
                is_default: '0',
                address_type: 'home',
                delivery_note: '',
                status: 1,
                latitude: '',
                longitude: '',
                full_address: '',
            });
        }
        // Clear validation errors when opening/closing the dialog
        setValidationErrors({});
    }, [addressToEdit, open]);

    const handleButtonClick = () => {
        setShowTextField(!showTextField);
    };

    const handleOpenMapAddressModel = () => {
        setOpenMapAddressModel(true);
    };

    const handleCloseMapAddressModel = () => {
        setOpenMapAddressModel(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validate the field as user types
        const error = validateField(name, value);

        setValidationErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[name] = [error];
            } else {
                delete newErrors[name];
            }
            return newErrors;
        });

        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleLocationConfirm = (locationData) => {
        const updatedFields = {
            latitude: locationData.lat,
            longitude: locationData.lng,
            full_address: locationData.fullAddress,
            location: locationData.fullAddress,
            state: locationData.state || '',
            city: locationData.city || '',
            pin_code: locationData.pin_code || '',
        };

        setFormData(prevData => ({
            ...prevData,
            ...updatedFields
        }));

        // Clear validation errors for the updated fields
        clearValidationErrors(['location', 'state', 'city', 'pin_code']);
        handleCloseMapAddressModel();
    };

    const handleSubmit = async () => {
        // First validate the form
        if (!validateForm()) {
            showSnackbar("Please fill in the mandatory fields before submitting.", { severity: 'error' }, 2000);
            return;
        }

        setLoading(true);

        try {
            const url = addressToEdit
                ? `${apiUrl}/portal/user/address/${addressToEdit.id}`
                : `${apiUrl}/portal/user/address/store_address_details`;

            const method = addressToEdit ? 'put' : 'post';

            const response = await axios[method](url, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('portal_token')}`,
                },
            });

            if (response.data.status) {
                showSnackbar(addressToEdit ? 'Address updated successfully' : 'Address stored successfully', { severity: 'success' }, 2000);
                onClose();
            } else {
                showSnackbar('Failed to store/update address: ' + response.data.message, { severity: 'error' }, 2000);
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setValidationErrors(error.response.data.errors);
                showSnackbar('Please fix the validation errors', { severity: 'error' }, 2000);
            } else {
                console.error('Error storing/updating address:', error);
                showSnackbar('An error occurred while storing/updating the address', { severity: 'error' }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog
                fullScreen={isMobile}
                open={open}
                onClose={onClose}
                TransitionComponent={Transition}
                keepMounted
                sx={
                    !isMobile
                        ? {
                            '& .MuiDialog-paper': {
                                position: 'fixed',
                                right: 0,
                                margin: 0,
                                width: '30%',
                                height: '100vh',
                                maxHeight: '100vh',
                            },
                        }
                        : {}
                }
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <AppBar
                        sx={{
                            position: 'sticky',
                            top: 0,
                            backgroundColor: '#fff',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                            zIndex: 10,
                        }}
                    >
                        <Toolbar>
                            <Typography sx={{ ml: 2, flex: 1, color: "black", fontWeight: "bold" }} variant="h6" component="div">
                                {addressToEdit ? 'Edit Delivery Address' : 'Add Delivery Address'}
                            </Typography>
                            <IconButton
                                edge="start"
                                color="black"
                                onClick={onClose}
                                aria-label="close"
                            >
                                <CloseIcon />
                            </IconButton>
                        </Toolbar>
                    </AppBar>

                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            padding: '16px',
                            backgroundColor: '#fff',
                        }}
                    >
                        {loading ? (
                            <Grid container spacing={2}>
                                {[...Array(10)].map((_, index) => (
                                    <Grid item xs={12} key={index}>
                                        <Skeleton variant="rectangular" height={35} sx={{ borderRadius: 3 }} />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Full Name (Required)"
                                        size='small'
                                        variant="outlined"
                                        name="full_name"
                                        value={formData.full_name || ''}
                                        onChange={handleChange}
                                        error={!!validationErrors.full_name}
                                        helperText={validationErrors.full_name ? validationErrors.full_name[0] : ''}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Phone Number (Required)"
                                        variant="outlined"
                                        type="tel"
                                        size='small'
                                        name="phone_number"
                                        value={formData.phone_number || ''}
                                        onChange={handleChange}
                                        error={!!validationErrors.phone_number}
                                        helperText={validationErrors.phone_number ? validationErrors.phone_number[0] : ''}
                                        InputProps={{
                                            startAdornment: <Typography variant="body1" style={{ marginRight: 8 }}>+91</Typography>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Add Alternate Phone Number"
                                        variant="outlined"
                                        type="tel"
                                        size='small'
                                        name="alternative_number"
                                        value={formData.alternative_number || ''}
                                        onChange={handleChange}
                                        error={!!validationErrors.alternative_number}
                                        helperText={validationErrors.alternative_number ? validationErrors.alternative_number[0] : ''}
                                        InputProps={{
                                            startAdornment: <Typography variant="body1" style={{ marginRight: 8 }}>+91</Typography>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Pincode (Required)"
                                        variant="outlined"
                                        size='small'
                                        name="pin_code"
                                        value={formData.pin_code || ''}
                                        onChange={handleChange}
                                        error={!!validationErrors.pin_code}
                                        helperText={validationErrors.pin_code ? validationErrors.pin_code[0] : ''}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        sx={{
                                            backgroundColor: "#9F63FF",
                                            '&:hover': {
                                                backgroundColor: '#7c48d0',
                                            },
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        startIcon={<MyLocationTwoToneIcon />}
                                        onClick={handleOpenMapAddressModel}
                                    >
                                        Your Location
                                    </Button>
                                </Grid>

                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="State"
                                        variant="outlined"
                                        name="state"
                                        size='small'
                                        value={formData.state || ''}
                                        onChange={handleChange}
                                        error={!!validationErrors.state}
                                        helperText={validationErrors.state ? validationErrors.state[0] : ''}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="City (Required)"
                                        variant="outlined"
                                        name="city"
                                        size='small'
                                        value={formData.city || ''}
                                        onChange={handleChange}
                                        error={!!validationErrors.city}
                                        helperText={validationErrors.city ? validationErrors.city[0] : ''}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="House No., Building Name (Required)"
                                        variant="outlined"
                                        name="building_details"
                                        size='small'
                                        value={formData.building_details || ''}
                                        onChange={handleChange}
                                        error={!!validationErrors.building_details}
                                        helperText={validationErrors.building_details ? validationErrors.building_details[0] : ''}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Road Name, Area, Colony (Required)"
                                        variant="outlined"
                                        name="location"
                                        size='small'
                                        value={formData.location || ''}
                                        onChange={handleChange}
                                        error={!!validationErrors.location}
                                        helperText={validationErrors.location ? validationErrors.location[0] : ''}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormLabel component="legend">Default Address ?</FormLabel>
                                    <RadioGroup
                                        row
                                        defaultValue="0"
                                        sx={{ mb: 1 }}
                                        name="is_default"
                                        value={formData.is_default || ''}
                                        onChange={handleChange}
                                    >
                                        <FormControlLabel
                                            value="1"
                                            control={<Radio />}
                                            label="Yes"
                                        />
                                        <FormControlLabel
                                            value="0"
                                            control={<Radio />}
                                            label="No"
                                        />
                                    </RadioGroup>
                                </Grid>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Button
                                            variant="text"
                                            fullWidth
                                            sx={{
                                                textTransform: 'none',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                marginLeft: 1,
                                                textOverflow: 'ellipsis',
                                                border: '1px solid #ccc',
                                                borderRadius: '8px',
                                                padding: '8px 16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center', // <-- center horizontally
                                                gap: 1, // space between icon and text
                                                '&:hover': {
                                                    borderColor: '#999',
                                                }
                                            }}
                                            onClick={handleButtonClick}
                                        >
                                            <AddLocationAltTwoToneIcon fontSize="small" />
                                            Add Nearby Famous Landmark
                                        </Button>
                                    </Grid>
                                    {showTextField && (
                                        <Grid item xs={12} sx={{ marginLeft: 2 }}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={2}
                                                label="Nearby Famous Landmark"
                                                variant="outlined"
                                                name="delivery_note"
                                                size='small'
                                                value={formData.delivery_note || ''}
                                                onChange={handleChange}
                                                error={!!validationErrors.delivery_note}
                                                helperText={validationErrors.delivery_note ? validationErrors.delivery_note[0] : ''}
                                            />
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>
                        )}
                    </Box>

                    <Box
                        sx={{
                            backgroundColor: '#fff',
                            padding: '16px',
                            borderTopLeftRadius: '10px',
                            borderTopRightRadius: '10px',
                            boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <FormLabel component="legend">Type of Address</FormLabel>
                        <RadioGroup
                            row
                            defaultValue="home"
                            sx={{ mb: 2 }}
                            name="address_type"
                            value={formData.address_type || ''}
                            onChange={handleChange}
                        >
                            <FormControlLabel
                                value="home"
                                control={<Radio />}
                                label={<Box display="flex" alignItems="center"><HomeTwoToneIcon sx={{ mr: 0.1 }} /> Home</Box>}
                            />
                            <FormControlLabel
                                value="work"
                                control={<Radio />}
                                label={<Box display="flex" alignItems="center"><HomeWorkTwoToneIcon sx={{ mr: 0.1 }} /> Work</Box>}
                            />
                            <FormControlLabel
                                value="other"
                                control={<Radio />}
                                label={<Box display="flex" alignItems="center"><OtherHousesTwoToneIcon sx={{ mr: 0.1 }} /> Other</Box>}
                            />
                        </RadioGroup>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{
                                width: '100%',
                                padding: '10px 0',
                                borderRadius: '25px',
                                backgroundColor: 'success.main',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                },
                            }}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <CircularProgress size={24} sx={{ color: '#fff' }} />
                            ) : (
                                'Save Address'
                            )}
                        </Button>
                    </Box>
                </Box>
            </Dialog>
            <MapAddressModel
                open={openMapAddressModel}
                onClose={handleCloseMapAddressModel}
                onConfirm={handleLocationConfirm}
            />
        </>
    );
};

export default AddAddressModel;
