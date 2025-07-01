import React from 'react';
import { Button, Typography, Grid } from '@mui/material';
import { styled } from '@mui/system';

const NotFoundDescription = styled(Typography)(({ theme }) => ({
    fontSize: '1.2rem',
    color: '#777',
    marginBottom: '20px',
    [theme.breakpoints.down('md')]: {
        fontSize: '1rem',
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.9rem',
    },
}));

const GoHomeButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#10d915',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '5px',
    fontSize: '1.2rem',
    transition: 'background-color 0.3s ease',
    textDecoration: 'none',
    '&:hover': {
        backgroundColor: '#0db311',
    },
    [theme.breakpoints.down('md')]: {
        fontSize: '1rem',
        padding: '8px 16px',
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.9rem',
        padding: '7px 14px',
    },
}));

const ProductsNotFound = ({ noProductsMessage, onGoBack }) => {
    return (
        <Grid item xs={12} style={{ textAlign: 'center' }}>
            <img src='/image/product_not_found.webp' alt="No Products Found" style={{ maxWidth: '100%', maxHeight: '400px', margin: '20px 0' }} loading="eager" decoding="async" />
            <Typography variant="h5" color="#f27474" style={{ fontWeight: 'bold' }}>
                {noProductsMessage}
            </Typography>
            <NotFoundDescription variant="body1">
                Oops! No products/services available right now. Exciting arrivals are coming soon!
            </NotFoundDescription>
            <GoHomeButton
                variant="contained"
                onClick={onGoBack}
                style={{ marginTop: 10 }}
            >
                Go Back
            </GoHomeButton>
        </Grid>
    );
};

export default ProductsNotFound;
