import React from 'react';
import { Card, CardContent, Skeleton } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '280px',
    display: 'flex',
    margin: '8px 4px',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
}));

const ProductCardSkeleton = () => {
    return (
        <StyledCard>
            <Skeleton variant="rectangular" height={120} />
            <CardContent style={{ padding: '10px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Skeleton variant="text" height={24} width="80%" />
                <Skeleton variant="text" height={20} width="60%" />
                <Skeleton variant="text" height={20} width="60%" />
                <Skeleton variant="text" height={36} width="50%" style={{ marginTop: '8px' }} />
            </CardContent>
        </StyledCard>
    );
};

export default ProductCardSkeleton;
