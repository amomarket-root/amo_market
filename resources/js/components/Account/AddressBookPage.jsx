import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Paper, Box, IconButton, Button, Skeleton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';
import HomeWorkTwoToneIcon from '@mui/icons-material/HomeWorkTwoTone';
import OtherHousesTwoToneIcon from '@mui/icons-material/OtherHousesTwoTone';
import MoreHorizTwoToneIcon from '@mui/icons-material/MoreHorizTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import axios from 'axios';
import AddressAddModel from '../Address/AddressAddModel';
import AddAddressModel from '../Address/AddAddressModel';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from '../Theme/SnackbarAlert';

const AddressBookPage = ({ onAddressSelect }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(false);
    const showSnackbar = useSnackbar();
    const apiUrl = import.meta.env.VITE_API_URL;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchAddresses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${apiUrl}/portal/user/address`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('portal_token')}`,
                },
            });
            setAddresses(response.data.data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            showSnackbar('Failed to fetch addresses', { severity: 'error' }, 2000);
        } finally {
            setLoading(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses, forceUpdate]);

    const handleDeleteAddress = async (addressId) => {
        try {
            await axios.delete(`${apiUrl}/portal/user/address/${addressId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('portal_token')}`,
                },
            });
            showSnackbar("Address deleted successfully", { severity: 'success' }, 2000);
            setForceUpdate(prev => !prev);
        } catch (error) {
            console.error('Error deleting address:', error);
            showSnackbar("Failed to delete address", { severity: 'error' }, 2000);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const onClose = () => {
        setAnchorEl(null);
    };

    const handleSelectAddress = (address) => {
        setSelectedAddress(address);
        onAddressSelect(address);
    };

    const handleModalClose = () => {
        setOpenModal(false);
        setSelectedAddress(null);
        setForceUpdate(prev => !prev);
    };

    return (
        <Container sx={{ maxWidth: '100%', padding: '0px', mt: 0 }} maxWidth={false}>
            {/* Header */}
            <Box sx={{ padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', ml: -3 }}>
                <IconButton onClick={() => window.history.back()}>
                    <ArrowBackIcon fontSize="large" color="#9F63FF" />
                </IconButton>
                <Typography variant="h5" sx={{ color: "#646363" }} fontWeight="bold">
                    Addresses
                </Typography>
            </Box>
            {/* Add Address Button */}
            <Box sx={{ mt: 2, mb: 2 }}>
                <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    sx={{
                        width: '100%',
                        borderRadius: '12px',
                        borderColor: 'success.main',
                        color: 'success.main',
                        padding: '12px 0',
                        '&:hover': {
                            borderColor: 'success.dark',
                            backgroundColor: 'transparent',
                            color: 'success.dark',
                        },
                    }}
                    onClick={() => setOpenModal(true)}
                >
                    Add a new address
                </Button>
            </Box>

            {/* Address List */}
            <Box>
                {loading ? (
                    // Skeleton Loader
                    Array.from({ length: 3 }).map((_, index) => (
                        <Paper key={index} elevation={3} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                                    <Skeleton variant="text" width="80%" height={16} />
                                </Box>
                                <Skeleton variant="circular" width={24} height={24} />
                            </Box>
                        </Paper>
                    ))
                ) : addresses.length === 0 ? (
                    // Empty State
                    <Paper elevation={3} sx={{ p: 2, mb: 2, borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            No addresses found. Add a new address!
                        </Typography>
                    </Paper>
                ) : (
                    // Address List
                    addresses.map((address) => (
                        <Paper
                            key={address.id}
                            elevation={3}
                            sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: 2,
                                cursor: 'pointer',
                                border: selectedAddress?.id === address.id ? '2px solid #9F63FF' : 'none'
                            }}
                            onClick={() => handleSelectAddress(address)}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {address.address_type === 'home' ? (
                                    <HomeTwoToneIcon sx={{ fontSize: 40, color: 'goldenrod', mr: 2 }} />
                                ) : address.address_type === 'work' ? (
                                    <HomeWorkTwoToneIcon sx={{ fontSize: 40, color: 'goldenrod', mr: 2 }} />
                                ) : (
                                    <OtherHousesTwoToneIcon sx={{ fontSize: 40, color: 'goldenrod', mr: 2 }} />
                                )}
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {address.address_type === 'home' ? 'Home' : address.address_type === 'work' ? 'Office' : 'Other'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {address.full_address}
                                    </Typography>
                                </Box>
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClick(e);
                                        setSelectedAddress(address);
                                    }}
                                    sx={{ p: 0 }}
                                >
                                    <MoreHorizTwoToneIcon sx={{ fontSize: 20, color: 'gray' }} />
                                </IconButton>
                            </Box>
                        </Paper>
                    ))
                )}
            </Box>

            {/* Menu for Edit/Delete */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={onClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem
                    onClick={() => {
                        setOpenModal(true);
                        onClose();
                    }}
                >
                    <ListItemIcon>
                        <EditTwoToneIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        handleDeleteAddress(selectedAddress.id);
                        onClose();
                    }}
                >
                    <ListItemIcon>
                        <DeleteTwoToneIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Remove</ListItemText>
                </MenuItem>
            </Menu>

            {/* Conditionally render the appropriate modal based on screen size */}
            {isMobile ? (
                <AddAddressModel
                    open={openModal}
                    onClose={handleModalClose}
                    refreshAddresses={() => setForceUpdate(prev => !prev)}
                    addressToEdit={selectedAddress}
                />
            ) : (
                <AddressAddModel
                    open={openModal}
                    onClose={handleModalClose}
                    refreshAddresses={() => setForceUpdate(prev => !prev)}
                    addressToEdit={selectedAddress}
                />
            )}
        </Container>
    );
};

export default AddressBookPage;
