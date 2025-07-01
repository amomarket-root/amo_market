import React from 'react';
import { Box, Avatar, Typography, Skeleton } from '@mui/material';
import { styled } from '@mui/system';

const CategoryHeaderContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#dbdbdb',
    padding: '5px 20px',
    overflowX: 'auto',
    '&::-webkit-scrollbar': {
        height: '2px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(to right, #2EDF0F, #7528FA)',
        borderRadius: '4px',
    },
    whiteSpace: 'nowrap',
    borderRadius: '15px',
}));

const CategoryHeader = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    marginRight: '10px',
    '& > *': {
        marginRight: '10px',
        cursor: 'pointer',
        fontSize: '16px',
        color: '#333',
        textDecoration: 'none',
        '&:hover': {
            color: theme.palette.primary.main,
        }
    },
}));

const CategoryHeaderComponent = ({ categories, loading, onCategoryClick }) => {
    return (
        <CategoryHeaderContainer>
            <CategoryHeader>
                {loading ? (
                    [...Array(6)].map((_, index) => (
                        <Box key={index} display="flex" alignItems="center">
                            <Skeleton variant="circular" width={45} height={45} sx={{ mr: 1 }} />
                            <Skeleton variant="text" width={150} height={30} />
                        </Box>
                    ))
                ) : (
                    categories.map((category) => (
                        <Box
                            key={category.id}
                            display="flex"
                            alignItems="center"
                            onClick={() => onCategoryClick(category.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Avatar src={category.image} alt={category.name} style={{ marginRight: '8px' }} />
                            <Typography variant="body1">
                                {category.name}
                            </Typography>
                        </Box>
                    ))
                )}
            </CategoryHeader>
        </CategoryHeaderContainer>
    );
};

export default CategoryHeaderComponent;
