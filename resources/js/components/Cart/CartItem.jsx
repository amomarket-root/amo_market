import React from 'react';
import { Box, Typography, IconButton, Button, Tooltip, Chip } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';

const CartItem = ({ cartItem, handleIncrease, handleDecrease, handleAdd }) => {

    const isProduct = !!cartItem.product;
    const item = isProduct ? cartItem.product : cartItem.service;
    const itemType = isProduct ? 'Product' : 'Service';

    // Render service icon based on service type using switch
    const renderServiceIcon = () => {
        if (!item.name) return null;

        let iconContent;
        const iconContainerStyle = {
            width: '50px',
            height: '50px',
            marginRight: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px'
        };

        switch (true) {
            case item.name.includes('Car Service Center'):
                iconContent = (
                    <img
                        src="/image/car_service.gif"
                        alt="Car Service"
                        style={{ width: 40, height: 40 }}
                    />
                );
                break;
            case item.name.includes('Internet Café'):
                iconContent = (
                    <img
                        src="/image/print.gif"
                        alt="Print"
                        style={{ width: 40, height: 40 }}
                    />
                );
                break;
            case item.name.includes('Beauty Parlor'):
                iconContent = (
                    <img
                        src="/image/beauty_parlour.gif"
                        alt="Print"
                        style={{ width: 40, height: 40 }}
                    />
                );
                break;
            case item.name.includes('TV Repair Services'):
                iconContent = (
                    <img
                        src="/image/tv_repair.gif"
                        alt="Print"
                        style={{ width: 40, height: 40 }}
                    />
                );
                break;
            case item.name.includes('Salon / Barber Shop'):
                iconContent = (
                    <img
                        src="/image/salon_shop.gif"
                        alt="Print"
                        style={{ width: 40, height: 40 }}
                    />
                );
                break;
            case item.name.includes('Mobile Repair Shop'):
                iconContent = (
                    <img
                        src="/image/mobile_repair.gif"
                        alt="Print"
                        style={{ width: 40, height: 40 }}
                    />
                );
                break;
            case item.name.includes('AC Service Center'):
                iconContent = (
                    <img
                        src="/image/ac_service.gif"
                        alt="Print"
                        style={{ width: 40, height: 40 }}
                    />
                );
                break;
            case item.name.includes('Home Appliances Store'):
                iconContent = (
                    <img
                        src="/image/home_appliance.gif"
                        alt="Print"
                        style={{ width: 40, height: 40 }}
                    />
                );
                break;
            default:
                iconContent = <DescriptionTwoToneIcon color="primary" />;
                break;
        }

        return <Box sx={iconContainerStyle}>{iconContent}</Box>;
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isProduct ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        style={{
                            width: '50px',
                            height: '50px',
                            marginRight: '10px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                        }}
                    />
                ) : (
                    renderServiceIcon()
                )}
                <Box sx={{ flex: 1 }}>
                    <Chip
                        label={itemType}
                        size="small"
                        sx={{
                            mr: 1,
                            fontSize: '0.6rem',
                            height: '18px',
                            backgroundColor: isProduct ? '#e3f2fd' : '#e8f5e9',
                            color: isProduct ? '#1976d2' : '#2e7d32'
                        }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Tooltip title={item.name}>
                            <Typography
                                variant="body1"
                                component="div"
                                style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '100%'
                                }}
                            >
                                {item.name}
                            </Typography>
                        </Tooltip>
                    </Box>

                    {isProduct ? (
                        <>
                            <Typography variant="body2" color="textSecondary">{item.weight}</Typography>
                            <Typography variant="body2" color="textPrimary" sx={{ fontWeight: "bold" }}>
                                {item.original_price && item.original_price !== item.price ? (
                                    <>
                                        <s>₹{item.original_price}</s> ₹{item.price}
                                    </>
                                ) : (
                                    `₹${item.price}`
                                )}
                            </Typography>
                        </>
                    ) : (
                        <Typography variant="body2" color="textPrimary">
                            Base Price: <strong>₹{item.base_price}</strong>
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Action buttons section */}
            {isProduct ? (
                <ProductActionButtons
                    cartItem={cartItem}
                    handleDecrease={handleDecrease}
                    handleIncrease={handleIncrease}
                    handleAdd={handleAdd}
                />
            ) : (
                <ServiceActionButton
                    cartItem={cartItem}
                    handleDecrease={handleDecrease}
                />
            )}
        </Box>
    );
};

// Extracted component for product action buttons
const ProductActionButtons = ({ cartItem, handleDecrease, handleIncrease, handleAdd }) => {
    const theme = useTheme();
    return cartItem.quantity > 0 ? (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            background: theme.palette.primary.main,
            borderRadius: '4px',
            padding: '2px 4px',
            color: 'white'
        }}>
            <IconButton
                size="small"
                onClick={() => handleDecrease(cartItem.id)}
                style={{ color: 'white', padding: '4px' }}
                aria-label="Decrease quantity"
            >
                <Remove />
            </IconButton>
            <Typography variant="body2" component="div" style={{ margin: '0 8px', color: 'white' }}>
                {cartItem.quantity}
            </Typography>
            <IconButton
                size="small"
                onClick={() => handleIncrease(cartItem.id)}
                style={{ color: 'white', padding: '4px' }}
                aria-label="Increase quantity"
            >
                <Add />
            </IconButton>
        </Box>
    ) : (
        <Button
            variant="outlined"
            size="small"
            color="primary"
            onClick={(e) => {
                e.stopPropagation();
                handleAdd(cartItem.id);
            }}
            style={{ height: '36px', minWidth: '64px' }}
            aria-label="Add product"
        >
            Add
        </Button>
    );
};

// Extracted component for service action button
const ServiceActionButton = ({ cartItem, handleDecrease }) => {
    return (
        <Button
            variant="contained"
            color="error"
            sx={{
                color: 'white',
                height: '35px',
                minWidth: '65px',
                fontSize: '0.65rem'
            }}
            startIcon={<DeleteIcon />}
            onClick={() => handleDecrease(cartItem.id)}
            aria-label="Remove service"
        >
            Remove
        </Button>
    );
};

export default CartItem;
