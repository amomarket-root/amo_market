import React from 'react';
import { Grid, Typography, Button } from '@mui/material';
import ProductCard from './ProductCard';
import { styled } from '@mui/system';
import ProductCardSkeleton from './ProductCardSkeleton';

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

const ProductsGrid = ({
    products,
    loading,
    initialLoad,
    noProductsMessage,
    onCardClick,
    onAdd,
    onIncrease,
    onDecrease,
    columns = { xs: 6, sm: 4, md: 3, lg: 2 } // Default to 6 products (AllProduct)
}) => {
    if (initialLoad || loading) {
        return (
            <Grid container>
                {Array.from(new Array(12)).map((_, index) => (
                    <Grid item {...columns} key={index}>
                        <ProductCardSkeleton />
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (products.length === 0) {
        return (
            <Grid item xs={12} style={{ textAlign: 'center' }}>
                <img src='/image/product_not_found.webp' alt="No Products Found" style={{ maxWidth: '100%', maxHeight: '400px', margin: '20px 0' }} loading="eager" decoding="async" />
                <Typography variant="h5" color="#f27474" style={{ fontWeight: 'bold' }}>
                    {noProductsMessage || 'No Products Found'}
                </Typography>
                <NotFoundDescription variant="body1">
                    Oops! No products available right now. Exciting arrivals are coming soon!
                </NotFoundDescription>
            </Grid>
        );
    }

    return (
        <Grid container>
            {products.map((product) => (
                <Grid item {...columns} key={product.id}>
                    <ProductCard
                        product={product}
                        onCardClick={onCardClick}
                        onAdd={onAdd}
                        onIncrease={onIncrease}
                        onDecrease={onDecrease}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default ProductsGrid;
