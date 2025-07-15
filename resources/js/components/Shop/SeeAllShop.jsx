import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Container, Grid, Card, CardMedia, CardContent, Typography, Tooltip, Skeleton, Box, useMediaQuery, IconButton } from '@mui/material';
import { AccessTime, Star } from '@mui/icons-material';
import { LocationContext } from '../Location/LocationContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/system';
import Theme from '../Theme/Theme';
import { ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { useSweetAlert } from '../Theme/SweetAlert';

const DesktopCard = styled(Card)({
    height: '340px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.35)',
    },
});

const MobileCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    height: 'auto',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.15)',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0px 8px 28px rgba(0, 0, 0, 0.3)',
    },
}));

const DesktopCardMedia = styled(CardMedia)({
    height: '180px',
    objectFit: 'cover'
});

const MobileCardMedia = styled(CardMedia)({
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '12px',
    margin: '3px',
    marginTop: '15px',
});

const ResponsiveHeaderBox = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
});

const OfflineOverlay = styled('div')({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
    borderRadius: 'inherit',
});

const fetchShops = async ({ queryKey }) => {
    const [_key, { latitude, longitude, apiUrl }] = queryKey;
    if (!latitude || !longitude) {
        throw new Error('Latitude and Longitude not available');
    }
    const response = await axios.get(`${apiUrl}/portal/see_all_shops`, {
        params: { latitude, longitude }
    });
    return response.data.data || [];
};

function SeeAllShop() {
    const navigate = useNavigate();
    const { latitude, longitude } = useContext(LocationContext);
    const apiUrl = import.meta.env.VITE_API_URL;
    const isMobile = useMediaQuery('(max-width:600px)');
    const showAlert = useSweetAlert();

    const { data: shops = [], isLoading, isError } = useQuery({
        queryKey: ['shops', { latitude, longitude, apiUrl }],
        queryFn: fetchShops,
        enabled: !!latitude && !!longitude,
        staleTime: 20 * 60 * 1000, // 20 minutes stale time
        keepPreviousData: true,
    });
    const handleBack = () => {
        navigate(-1); // Go to previous page
    };
    const handleCardClick = async (shopId, shopPertainType, isOnline) => {
        if (!isOnline) {
            // Using the showAlert function directly
            await showAlert({
                title: 'Shop is Offline',
                text: 'This shop is currently offline. We will notify you when it becomes available.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }
        navigate(`/shop_product_list/${shopId}/${shopPertainType}`);
    };

    const renderDesktopCard = (shop) => (
        <DesktopCard
            onClick={() => handleCardClick(shop.id, shop.type, shop.online_status)}
            sx={{
                backgroundColor: shop.online_status ? 'background.paper' : 'action.disabledBackground',
                position: 'relative'
            }}
        >
            {!shop.online_status && <OfflineOverlay />}
            <DesktopCardMedia
                component="img"
                image={shop.image}
                alt={shop.name}
                loading="eager"
                decoding="async"
                sx={{ opacity: shop.online_status ? 1 : 0.7 }}
            />
            <CardContent sx={{ padding: '10px', flexGrow: 1 }}>
                <Tooltip title={shop.name}>
                    <Typography variant="body1" fontWeight="bold" noWrap>
                        {shop.name}
                    </Typography>
                </Tooltip>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <Star style={{ color: '#32d032', marginRight: '5px', fontSize: '20px' }} />
                    <Typography variant="body2" color="textSecondary" style={{ lineHeight: '24px' }}>
                        {shop.rating}  •  <AccessTime style={{ marginRight: '5px', fontSize: '20px', verticalAlign: 'sub' }} /> {shop.time}
                    </Typography>
                </div>
                <Tooltip title={shop.description}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        component="div"
                        style={{
                            marginTop: '8px',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%'
                        }}
                    >
                        {shop.description}
                    </Typography>
                </Tooltip>
                <Tooltip title={shop.location}>
                    <Typography
                        variant="body2"
                        component="div"
                        style={{
                            marginTop: '8px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%'
                        }}
                    >
                        {shop.location}
                    </Typography>
                </Tooltip>
            </CardContent>
        </DesktopCard>
    );

    const renderMobileCard = (shop) => (
        <MobileCard
            onClick={() => handleCardClick(shop.id, shop.type, shop.online_status)}
            sx={{
                backgroundColor: shop.online_status ? 'background.paper' : 'action.disabledBackground',
                position: 'relative'
            }}
        >
            {!shop.online_status && <OfflineOverlay />}
            <MobileCardMedia
                component="img"
                image={shop.image}
                alt={shop.name}
                loading="lazy"
                decoding="async"
                sx={{ opacity: shop.online_status ? 1 : 0.7 }}
            />
            <CardContent sx={{ padding: '5px', flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={0.5}>
                    <Tooltip title={shop.name}>
                        <Typography variant="subtitle1" fontWeight="bold" noWrap>
                            {shop.name}
                        </Typography>
                    </Tooltip>
                </Box>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Star style={{ color: '#32d032', marginRight: '5px', fontSize: '20px' }} />
                    <Typography variant="body2" color="textSecondary" style={{ lineHeight: '24px' }}>
                        {shop.rating}  •  <AccessTime style={{ marginRight: '5px', fontSize: '20px', verticalAlign: 'sub' }} /> {shop.time}
                    </Typography>
                </div>
                <Tooltip title={shop.description}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {shop.description}
                    </Typography>
                </Tooltip>
                <Tooltip title={shop.location}>
                    <Typography
                        variant="body2"
                        sx={{
                            mt: 0.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {shop.location}
                    </Typography>
                </Tooltip>
            </CardContent>
        </MobileCard>
    );

    const renderSkeleton = () => (
        isMobile ? (
            <MobileCard>
                <Skeleton variant="rectangular" width={100} height={100} sx={{ margin: 1, borderRadius: 5 }} />
                <CardContent sx={{ flex: 1 }}>
                    <Skeleton width="60%" height={24} />
                    <Skeleton width="40%" height={20} />
                    <Skeleton width="100%" height={20} />
                    <Skeleton width="80%" height={20} />
                </CardContent>
            </MobileCard>
        ) : (
            <DesktopCard>
                <Skeleton variant="rectangular" height={180} />
                <CardContent sx={{ padding: '10px', flexGrow: 1 }}>
                    <Skeleton variant="text" height={24} width="80%" />
                    <Skeleton variant="text" height={20} width="60%" />
                    <Skeleton variant="text" height={20} width="60%" />
                    <Skeleton variant="text" height={36} width="50%" sx={{ marginTop: '8px' }} />
                </CardContent>
            </DesktopCard>
        )
    );

    return (
        <Container sx={{ maxWidth: '100%', padding: isMobile ? '0 2px' : '0px' }} maxWidth={false}>
            <ThemeProvider theme={Theme}>
                <ResponsiveHeaderBox>
                    <Box display="flex" alignItems="center" gap={4}>
                        <IconButton
                            onClick={handleBack}
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: '#f0f0f0',
                                '&:hover': {
                                    backgroundColor: '#e0e0e0',
                                },
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        {isLoading ? (
                            <Skeleton variant="text" width={350} height={35} />
                        ) : (
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {isMobile ? 'Local shop in your location' : 'Recommended Nearby Shops for You'}
                            </Typography>
                        )}
                    </Box>
                </ResponsiveHeaderBox>

                <Grid container spacing={isMobile ? 2 : 3} justifyContent="flex-start">
                    {isLoading || isError || shops.length === 0 ? (
                        Array.from(new Array(10)).map((_, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                {renderSkeleton()}
                            </Grid>
                        ))
                    ) : (
                        shops.map((shop) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={shop.id}>
                                {isMobile ? renderMobileCard(shop) : renderDesktopCard(shop)}
                            </Grid>
                        ))
                    )}
                </Grid>
            </ThemeProvider>
        </Container>
    );
}

export default SeeAllShop;
