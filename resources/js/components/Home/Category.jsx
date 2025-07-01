import React, { useContext } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { Container, Grid, Card, CardContent, Typography, CardMedia, Skeleton } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { LocationContext } from '../Location/LocationContext';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '180px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.3)',
    },
    [theme.breakpoints.down('sm')]: {
        height: '150px',
    },
    [theme.breakpoints.down('xs')]: {
        height: '120px',
    },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
    height: '100%',
    width: '100%',
    objectFit: 'cover',
    [theme.breakpoints.down('sm')]: {
        height: '80%',
        objectFit: 'contain',
    },
    [theme.breakpoints.down('xs')]: {
        height: '70%',
        objectFit: 'contain',
    },
}));

const fetchCategories = async ({ queryKey }) => {
    const [_key, { latitude, longitude, apiUrl }] = queryKey;
    if (!latitude || !longitude) throw new Error('Location data not available');
    const { data } = await axios.get(`${apiUrl}/portal/category`, {
        params: { latitude, longitude },
    });
    return data.data;
};

const Category = () => {
    const theme = useTheme();
    const { latitude, longitude } = useContext(LocationContext);
    const apiUrl = import.meta.env.VITE_API_URL;
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();

    // Use React Query to fetch categories
    const { data: categories = [], isLoading, isError } = useQuery({
        queryKey: ['categories', { latitude, longitude, apiUrl }],
        queryFn: fetchCategories,
        enabled: !!latitude && !!longitude, // Prevents fetching if lat/lon are missing
        staleTime: 1000 * 60 * 20, // Cache data for 20 minutes
        retry: 1, // Retry once if there's an error
    });

    const handleCardClick = (categoryId) => {
        navigate(`/all_product/subcategory/${categoryId}`);
    };

    return (
        <Container sx={{ marginTop: '30px', marginBottom: '10px', maxWidth: '100%', padding: '0px'}} maxWidth={false}>
            <Grid container spacing={1}>
                {isLoading || isError ? (
                    isMobile ? (
                        Array.from(new Array(12)).map((_, index) => (
                            <Grid item xs={3} sm={4} md={1.2} key={index}>
                                <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '8px' }} />
                            </Grid>
                        ))
                    ) : (
                        Array.from(new Array(20)).map((_, index) => (
                            <Grid item xs={3} sm={4} md={1.2} key={index}>
                                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: '8px' }} />
                            </Grid>
                        ))
                    )
                ) : (
                    categories.map((category) => (
                        <Grid item xs={3} sm={4} md={1.2} key={category.id}>
                            <StyledCard onClick={() => handleCardClick(category.id)}>
                                {category.content_image ? (
                                    <StyledCardMedia
                                        component="img"
                                        image={category.content_image}
                                        alt={category.name}
                                        loading="eager"
                                        decoding="async"
                                    />
                                ) : (
                                    <>
                                        <StyledCardMedia
                                            component="img"
                                            style={{ height: '100px', marginTop: '8px' }}
                                            image={category.image}
                                            alt={category.name}
                                            loading="eager"
                                            decoding="async"
                                        />
                                        <CardContent
                                            style={{
                                                flexGrow: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                component="div"
                                                align="center"
                                                style={{ fontWeight: 'bold' }}
                                            >
                                                {category.name}
                                            </Typography>
                                        </CardContent>
                                    </>
                                )}
                            </StyledCard>
                        </Grid>
                    ))
                )}
            </Grid>
        </Container>
    );
};

export default Category;
