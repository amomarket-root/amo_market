import React from 'react';
import { Grid } from '@mui/material';
import ProductCard from './ProductCard';
import ShopProductSkeleton from './ShopProductSkeleton';
import ProductsNotFound from './ProductsNotFound';

export const ProductGrid = ({
    loading,
    shopProducts,
    shopPertainType,
    noProductsMessage,
    handleGoBack,
    handleCardClick,
    handleAdd,
    handleIncrease,
    handleDecrease
}) => {
    if (loading) {
        return <ShopProductSkeleton shopPertainType={shopPertainType} />;
    }

    if (shopProducts.length > 0) {
        return (
            <Grid container>
                {shopProducts.map((product) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={product.id}>
                        <ProductCard
                            product={product}
                            handleCardClick={handleCardClick}
                            handleAdd={handleAdd}
                            handleIncrease={handleIncrease}
                            handleDecrease={handleDecrease}
                        />
                    </Grid>
                ))}
            </Grid>
        );
    }

    return (
        <ProductsNotFound
            noProductsMessage={noProductsMessage}
            onGoBack={handleGoBack}
        />
    );
};
