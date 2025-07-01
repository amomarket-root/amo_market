import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LocationContext } from '../Location/LocationContext';
import { Container, Card, Skeleton } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import Slider from 'react-slick';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.spacing(1),
    boxShadow: 'none',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
}));

const ImageContainer = styled('div')({
    width: '100%',
    height: 'auto',
    overflow: 'hidden',
    borderRadius: 'inherit',
});

const StyledImage = styled('img')({
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    display: 'block',
    borderRadius: '5px',
});

const fetchBanners = async ({ queryKey }) => {
    const [_key, { latitude, longitude, apiUrl }] = queryKey;
    if (!latitude || !longitude) {
        throw new Error('Latitude and Longitude not available');
    }
    const response = await axios.get(`${apiUrl}/portal/banners`, {
        params: { latitude, longitude, radius: 2 },
    });
    return response.data.data || [];
};

const Banner = () => {
    const theme = useTheme();
    const apiUrl = import.meta.env.VITE_API_URL;
    const { latitude, longitude } = useContext(LocationContext);
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();

    const { data: banners = [], isLoading, isError } = useQuery({
        queryKey: ['banners', { latitude, longitude, apiUrl }],
        queryFn: fetchBanners,
        enabled: !!latitude && !!longitude,
        staleTime: 20 * 60 * 1000,
        keepPreviousData: true,
    });

    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 6000,
        arrows: !isMobile,
        adaptiveHeight: true,
    };

    const handleBannerClick = (shopId) => {
        if (shopId) {
            navigate(`/shop_product_list/${shopId}`);
        }
    };

    return (
        <Container sx={{ maxWidth: '100%', overflowX: 'hidden', padding: '0px' }} maxWidth={false}>
            {isLoading || isError || banners?.length === 0 ? (
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={isMobile ? 60 : 200}
                    style={{ marginBottom: '20px', borderRadius: '5px' }}
                />
            ) : (
                <Slider {...settings}>
                    {banners.map((banner, index) => (
                        <div key={index} style={{ marginBottom: '10px', width: '100%' }}>
                            {banner.content_image && (
                                <StyledCard onClick={() => handleBannerClick(banner.shop_id)}>
                                    <ImageContainer>
                                        <StyledImage
                                            src={banner.content_image}
                                            alt={banner.title}
                                            loading="eager"
                                            decoding="async"
                                        />
                                    </ImageContainer>
                                </StyledCard>
                            )}
                        </div>
                    ))}
                </Slider>
            )}
        </Container>
    );
};

export default Banner;
