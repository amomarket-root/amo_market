import React, { useState, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Paper, Menu, MenuItem, ListItemIcon, ListItemText, Skeleton } from '@mui/material';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';
import HomeWorkTwoToneIcon from '@mui/icons-material/HomeWorkTwoTone';
import OtherHousesTwoToneIcon from '@mui/icons-material/OtherHousesTwoTone';
import MoreHorizTwoToneIcon from '@mui/icons-material/MoreHorizTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddAddressModel from './AddAddressModel';
import AddressAddModel from './AddressAddModel';
import { useSnackbar } from '../Theme/SnackbarAlert';
import { useSweetAlert } from '../Theme/SweetAlert';
import axios from 'axios';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
});

const AddressModel = ({ open, onClose, onAddressSelect }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [openAddAddressModel, setOpenAddAddressModel] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    const showSnackbar = useSnackbar();
    const showAlert = useSweetAlert();

    const fetchAddresses = useCallback(async () => {
        try {
            const response = await axios.get(`${apiUrl}/portal/user/address`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('portal_token')}`,
                },
            });
            setAddresses(response.data?.data || []); // Ensure we always have an array
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setAddresses([]); // Set to empty array on error
        } finally {
            setLoading(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        if (open) {
            fetchAddresses();
        }
    }, [open, fetchAddresses]);

    const handleDeleteAddress = async (addressId) => {
        try {
            await axios.delete(`${apiUrl}/portal/user/address/${addressId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('portal_token')}`,
                },
            });
            fetchAddresses();
            showSnackbar("Address deleted successfully!", { severity: 'success' }, 2000);
        } catch (error) {
            console.error('Error deleting address:', error);
            showSnackbar("Failed to delete address", { severity: 'error' }, 2000);
        }
    };

    const handleEditAddress = (address) => {
        setSelectedAddress(address);
        setOpenAddAddressModel(true);
    };

    const handleCloseAddAddressModel = () => {
        setOpenAddAddressModel(false);
        setSelectedAddress(null);
        fetchAddresses();
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleOpenAddAddressModel = () => {
        setOpenAddAddressModel(true);
    };

    const handleSelectAddress = (address) => {
        setSelectedAddress(address);
        onAddressSelect(address);
    };

    const handleProcessToCheckout = () => {
        if (!selectedAddress) {
            showAlert({
                title: 'No Address Selected',
                text: 'Please select an address before proceeding to checkout',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        } else {
            onClose();
            // You can add additional checkout logic here if needed
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
                                width: '35%',
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
                            color: 'transparent',
                            borderBottomLeftRadius: '10px',
                            borderBottomRightRadius: '10px',
                            zIndex: 10,
                        }}
                    >
                        <Toolbar>
                            <IconButton edge="start" onClick={onClose} aria-label="back">
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography sx={{ ml: 2, flex: 1, color: 'black', fontWeight: 'bold' }} variant="h6">
                                Select delivery address
                            </Typography>
                        </Toolbar>
                    </AppBar>

                    <Box sx={{ mt: 2, backgroundColor: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}>
                        <Button
                            startIcon={<AddIcon />}
                            variant="outlined"
                            sx={{
                                width: '100%',
                                borderRadius: '12px',
                                borderColor: 'success.main',
                                color: 'success.main',
                                mb: 1,
                                padding: '12px 0',
                                '&:hover': {
                                    borderColor: 'success.dark',
                                    backgroundColor: 'transparent',
                                    color: 'success.dark',
                                },
                            }}
                            onClick={handleOpenAddAddressModel}
                        >
                            Add a new address
                        </Button>
                    </Box>

                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            backgroundColor: '#f5f5f5',
                            padding: '10px',
                        }}
                    >
                        <Typography variant="body2" sx={{ mb: 2, ml: 1, color: 'gray' }}>
                            Your saved address
                        </Typography>

                        {loading ? (
                            // Skeleton Loader
                            Array.from({ length: 3 }).map((_, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        backgroundColor: '#fff',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                                        <Skeleton variant="text" width="80%" height={16} />
                                    </Box>
                                    <Skeleton variant="circular" width={24} height={24} />
                                </Box>
                            ))
                        ) : (
                            // Actual Address List
                            addresses?.length > 0 ? (
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
                                                <HomeTwoToneIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                            ) : address.address_type === 'work' ? (
                                                <HomeWorkTwoToneIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                            ) : (
                                                <OtherHousesTwoToneIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
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
                                            <Menu
                                                anchorEl={anchorEl}
                                                open={Boolean(anchorEl)}
                                                onClose={handleCloseMenu}
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
                                                        handleEditAddress(selectedAddress);
                                                        handleCloseMenu();
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
                                                        handleCloseMenu();
                                                    }}
                                                >
                                                    <ListItemIcon>
                                                        <DeleteTwoToneIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText>Remove</ListItemText>
                                                </MenuItem>
                                            </Menu>
                                        </Box>
                                    </Paper>
                                ))
                            ) : (
                                <Box sx={{ textAlign: 'center', p: 4 }}>
                                    <Typography variant="body1" color="textSecondary">
                                        No saved addresses found
                                    </Typography>
                                </Box>
                            )
                        )}
                    </Box>

                    <Box
                        sx={{
                            position: 'sticky',
                            bottom: 0,
                            backgroundColor: '#fff',
                            padding: '16px',
                            borderTopLeftRadius: '10px',
                            borderTopRightRadius: '10px',
                            boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <Button
                            variant="contained"
                            sx={{
                                width: '100%',
                                padding: '10px 0',
                                borderRadius: '25px',
                                backgroundColor: 'success.main',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                },
                            }}
                            onClick={handleProcessToCheckout}
                        >
                            Process to Checkout
                        </Button>
                    </Box>
                </Box>
            </Dialog>

            {/* Conditionally render the appropriate modal based on screen size */}
            {isMobile ? (
                <AddAddressModel
                    open={openAddAddressModel}
                    onClose={handleCloseAddAddressModel}
                    addressToEdit={selectedAddress}
                />
            ) : (
                <AddressAddModel
                    open={openAddAddressModel}
                    onClose={handleCloseAddAddressModel}
                    addressToEdit={selectedAddress}
                />
            )}
        </>
    );
};

export default AddressModel;
