import React from 'react';
import { Typography, IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/system';
import ProductCard from './ProductCard';

const ScrollContainer = styled('div')({
    display: 'flex',
    overflowX: 'auto',
    paddingBottom: '10px',
    position: 'relative',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
        display: 'none',
    },
});

const ArrowButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    zIndex: 2,
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
}));

const ProductCategorySection = React.memo(({
    categoryName,
    products,
    scrollPosition,
    scrollRef,
    theme,
    handleScroll,
    handleCardClick,
    handleAdd,
    handleIncrease,
    handleDecrease
}) => {
    const firstSubcategory = products[0];
    const categoryId = firstSubcategory?.sub_category?.category?.id ?? null;

    return (
        <div style={{ marginBottom: '10px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom style={{ marginBottom: '15px', fontWeight: 'bold' }}>
                    {categoryName}
                </Typography>
                {categoryId && (
                    <Link to={`/all_product/${categoryId}`} style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
                        See All
                    </Link>
                )}
            </div>
            <div style={{ position: 'relative' }}>
                {scrollPosition > 0 && (
                    <ArrowButton onClick={() => handleScroll('left')} style={{ left: 0 }}>
                        <ArrowBackIos />
                    </ArrowButton>
                )}
                <ScrollContainer ref={scrollRef}>
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            theme={theme}
                            handleCardClick={handleCardClick}
                            handleAdd={handleAdd}
                            handleIncrease={handleIncrease}
                            handleDecrease={handleDecrease}
                        />
                    ))}
                </ScrollContainer>
                {scrollPosition < scrollRef?.current?.scrollWidth - scrollRef?.current?.clientWidth && (
                    <ArrowButton onClick={() => handleScroll('right')} style={{ right: 0 }}>
                        <ArrowForwardIos />
                    </ArrowButton>
                )}
            </div>
        </div>
    );
});

export default ProductCategorySection;
