import React from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Skeleton } from '@mui/material';

export const ShopHeader = ({ selectedShop, loading, shopProducts, sortBy, setSortBy }) => {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '5px',
            marginTop: '5px',
            marginBottom: '10px',
            flexDirection: 'row',
            '&.MuiBox-root': {
                '@media (max-width:600px)': {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '8px',
                },
            },
        }}>
            {selectedShop && (
                loading ? (
                    <Skeleton variant="text" width={300} height={32} />
                ) : (
                    <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                        Products from {selectedShop}
                    </Typography>
                )
            )}
            {shopProducts.length > 0 && (
                <Box display="flex" gap={1} sx={{
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                }}>
                    <FormControl variant="outlined" sx={{
                        minWidth: 230,
                        width: { xs: '100%', sm: 230 }
                    }}>
                        {loading ? (
                            <Skeleton variant="rectangular" height={35} />
                        ) : (
                            <>
                                <InputLabel>Sort By</InputLabel>
                                <Select
                                    size="small"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    label="Sort By"
                                >
                                    <MenuItem value="Relevance">Relevance</MenuItem>
                                    <MenuItem value="Price(L-H)">Price(Low to High)</MenuItem>
                                    <MenuItem value="Price(H-L)">Price(High to Low)</MenuItem>
                                    <MenuItem value="discount">Discount(High to Low)</MenuItem>
                                </Select>
                            </>
                        )}
                    </FormControl>
                </Box>
            )}
        </Box>
    );
};
