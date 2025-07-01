import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Skeleton, Box } from '@mui/material';

const SortFilter = ({ sortBy, loading, onSortChange }) => {
    return (
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
                            onChange={onSortChange}
                            label="Sort By"
                            fullWidth
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
    );
};

export default SortFilter;
