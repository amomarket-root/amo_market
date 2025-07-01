import React, { useContext } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Container, Grid, Card, CardContent, Typography, CardMedia, Skeleton } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { LocationContext } from '../Location/LocationContext';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '220px',
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
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
    height: '100%',
    width: '100%',
    objectFit: 'cover',
    [theme.breakpoints.down('sm')]: {
        height: '100%',
        objectFit: 'contain',
    },
}));

const fetchServices = async ({ queryKey }) => {
    const [_key, { latitude, longitude, apiUrl }] = queryKey;
    if (!latitude || !longitude) throw new Error('Location data not available');
    const { data } = await axios.get(`${apiUrl}/portal/services`, {
        params: { latitude, longitude },
    });
    return data.data;
};

const Services = () => {
    const theme = useTheme();
    const { latitude, longitude } = useContext(LocationContext);
    const apiUrl = import.meta.env.VITE_API_URL;
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();

    const { data: services = [], isLoading, isError } = useQuery({
        queryKey: ['services', { latitude, longitude, apiUrl }],
        queryFn: fetchServices,
        enabled: !!latitude && !!longitude,
        staleTime: 1000 * 60 * 20,
        retry: 1,
    });

    const handleCardClick = (shopId,shopPertainType) => {
        navigate(`/shop_product_list/${shopId}/${shopPertainType}`);
    };

    return (
        <Container sx={{ marginTop: '30px', marginBottom: '10px', maxWidth: '100%', padding: '0px' }} maxWidth={false}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isLoading || services.length === 0 ? (
                    <Skeleton variant="text" width={200} height={40} />
                ) : (
                    <Typography variant="h6" gutterBottom style={{ marginBottom: '15px', fontWeight: 'bold' }}>
                        Nearest Services
                    </Typography>
                )}
            </div>
            <Grid container spacing={1}>
                {isLoading || isError ? (
                    Array.from(new Array(isMobile ? 4 : 8)).map((_, index) => (
                        <Grid item xs={3} sm={3} md={1.5} key={index}>
                            <Skeleton
                                variant="rectangular"
                                height={isMobile ? 150 : 220}
                                sx={{ borderRadius: '8px' }}
                            />
                        </Grid>
                    ))
                ) : (
                    services.map((service) => (
                        <Grid item xs={3} sm={3} md={1.5} key={service.id}>
                            <StyledCard onClick={() => handleCardClick(service.shop_id, service.shop_type)}>
                                {service.content_image ? (
                                    <StyledCardMedia
                                        component="img"
                                        image={service.content_image}
                                        alt={service.name}
                                        loading="eager"
                                        decoding="async"
                                    />
                                ) : (
                                    <>
                                        <StyledCardMedia
                                            component="img"
                                            style={{ height: '100px', marginTop: '8px' }}
                                            image={service.image}
                                            alt={service.name}
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
                                                {service.name}
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

export default Services;
