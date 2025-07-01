import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LocationContext } from '../Location/LocationContext';
import { Container, Card, Skeleton } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import Slider from 'react-slick';
import axios from 'axios';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    boxShadow: 'none',
    textAlign: 'center',
    margin: '0 8px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease-in-out',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        width: '100%',
        height: 'auto',
    },
    [theme.breakpoints.up('sm')]: {
        width: '95%',
        height: 200,
    },
    '&:hover': {
        transform: 'scale(1.02)',
    },
}));

const Advisement = () => {
    const theme = useTheme();
    const apiUrl = import.meta.env.VITE_API_URL;
    const { latitude, longitude } = useContext(LocationContext);
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate(); // Add useNavigate hook for navigation

    // Fetch advisements using React Query (v5 compatible)
    const { data: advisements, isLoading, isError } = useQuery({
        queryKey: ['advisements', latitude, longitude], // Query key as an array
        queryFn: async () => {
            if (!latitude || !longitude) {
                throw new Error('Latitude and Longitude not available');
            }
            const response = await axios.get(`${apiUrl}/portal/advisement`, {
                params: {
                    latitude: latitude,
                    longitude: longitude,
                    radius: 2, // Use dynamic radius
                },
            });
            return response.data.data; // Return the data
        },
        enabled: !!latitude && !!longitude, // Only fetch when latitude and longitude are available
        staleTime: 1000 * 60 * 20, // Cache data for 20 minutes
    });

    const settings = {
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true,
                },
            },
            {
                breakpoint: 960,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 400,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    // Handle advisement click to navigate to shop product list
    const handleAdvisementClick = (shopId, shopPertainType) => {
        if (shopId, shopPertainType) {
            navigate(`/shop_product_list/${shopId}/${shopPertainType}`);
        }
    };

    return (
        <Container sx={{ maxWidth: '100%', marginTop: '20px', overflowX: 'hidden', padding: '0px' }} maxWidth={false}>
            {isLoading || isError || advisements?.length === 0 ? (
                <Slider {...settings}>
                    {Array(isMobile ? 2 : 4).fill(0).map((_, index) => (
                        <div key={index} style={{ margin: '0 4px' }}>
                            <Skeleton
                                variant="rect"
                                width={isMobile ? '96%' : '96%'}
                                height={isMobile ? 120 : 200}
                                style={{ borderRadius: '10px' }}
                            />
                        </div>
                    ))}
                </Slider>
            ) : (
                <Slider {...settings}>
                    {advisements?.map((advisement, index) => (
                        <div key={index} style={{ margin: '0 4px' }}>
                            {advisement.content_image && (
                                <StyledCard
                                    style={{ backgroundColor: advisement.background_colour }}
                                    onClick={() => handleAdvisementClick(advisement.shop_id, advisement.shop_type)}
                                >
                                    <img
                                        src={advisement.content_image}
                                        alt={advisement.title}
                                        style={{ width: '100%', height: 'auto', borderRadius: '10px' }}
                                        loading="eager"
                                        decoding="async"
                                    />
                                </StyledCard>
                            )}
                        </div>
                    ))}
                </Slider>
            )}
        </Container>
    );
};

export default Advisement;
