import React from 'react';
import { Box, Grid, Card, Skeleton } from '@mui/material';

const ShopProductSkeleton = ({ shopPertainType }) => {
    if (shopPertainType === 'service') {
        return (
            <Box width="100%">
                <Skeleton variant="text" width="80%" height={50} style={{ marginBottom: 10 }} />
                <Box sx={{ width: '100%' }}>
                    <Grid container spacing={2}>
                        {[1, 2, 3, 4].map((item) => (
                            <Grid item xs={12} sm={6} md={3} key={item}>
                                <Card sx={{ height: 300 }}>
                                    <Skeleton variant="rectangular" width="100%" height="100%" />
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        );
    }

    // Default product skeleton loader
    return (
        <Grid container>
            {Array.from(new Array(12)).map((_, index) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                    <Card sx={{ height: '280px', margin: '4px 2px' }}>
                        <Skeleton variant="rectangular" height={120} />
                        <Box
                            sx={{
                                padding: '10px',
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Skeleton variant="text" height={24} width="80%" />
                            <Skeleton variant="text" height={20} width="60%" />
                            <Skeleton variant="text" height={20} width="60%" />
                            <Skeleton variant="text" height={36} width="50%" style={{ marginTop: '8px' }} />
                        </Box>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default ShopProductSkeleton;
