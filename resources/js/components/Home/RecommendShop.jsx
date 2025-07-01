import React, { useState, useContext } from 'react';
import { LocationContext } from '../Location/LocationContext';
import { Container, Card, CardMedia, CardContent, Typography, Skeleton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, AccessTime } from '@mui/icons-material';
import Tooltip from "@mui/material/Tooltip";
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const fetchShops = async ({ queryKey }) => {
    const [_key, { latitude, longitude, apiUrl }] = queryKey;
    if (!latitude || !longitude) throw new Error('Location data not available');
    const { data } = await axios.get(`${apiUrl}/portal/shops`, {
        params: { latitude, longitude },
    });
    return data.data;
};

const RecommendShop = () => {
    const { latitude, longitude } = useContext(LocationContext);
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    const { data: shops = [], isLoading, isError } = useQuery({
        queryKey: ['shops', { latitude, longitude, apiUrl }],
        queryFn: fetchShops,
        enabled: !!latitude && !!longitude,
        staleTime: 1000 * 60 * 20, // Cache data for 20 minutes
        retry: 1,
    });

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 5,
        swipeToSlide: true,
        draggable: true,
        autoplay: true,
        autoplaySpeed: 3000, // Auto slide every 3 seconds
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    arrows: false,
                    swipeToSlide: true,
                    draggable: true,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1.5,
                    slidesToScroll: 1,
                    arrows: false,
                    swipeToSlide: true,
                    draggable: true,
                },
            },
        ],
    };

    const handleCardClick = (shopId, shopPertainType) => {
        navigate(`/shop_product_list/${shopId}/${shopPertainType}`);
    };

    return (
        <Container sx={{ marginTop: '10px', marginBottom: '10px', maxWidth: '100%', padding: '0px' }} maxWidth={false}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isLoading || shops.length === 0 ? (
                    <Skeleton variant="text" width={280} height={40} />
                ) : (
                    <Typography variant="h6" gutterBottom style={{ marginBottom: '15px', fontWeight: 'bold' }}>
                        Local shop In your location
                    </Typography>
                )}
                {isLoading || shops.length === 0 ? (
                    <Skeleton variant="text" width={60} height={30} />
                ) : (
                    <Link to={`/see_all_shop`} style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 'bold' }}>
                        See All
                    </Link>
                )}
            </div>
            <Slider {...settings}>
                {isLoading || shops.length === 0 ? (
                    Array.from(new Array(5)).map((_, index) => (
                        <div key={index}>
                            <Card
                                sx={{
                                    margin: '0 4px',
                                    height: '100%',
                                    cursor: 'pointer',
                                    borderRadius: '14px',
                                    transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
                                        transform: 'scale(1.02)',
                                    },
                                }}
                            >
                                <Skeleton variant="rectangular" height={140} />
                                <CardContent>
                                    <Skeleton variant="text" height={30} width="80%" />
                                    <Skeleton variant="text" height={20} width="60%" />
                                    <Skeleton variant="text" height={20} width="60%" />
                                </CardContent>
                            </Card>
                        </div>
                    ))
                ) : (
                    shops.map((shop, index) => (
                        <div key={index}>
                            <Card
                                sx={{
                                    margin: '0 4px',
                                    marginBottom: '10px',
                                    height: '100%',
                                    cursor: 'pointer',
                                    borderRadius: '14px',
                                    transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
                                        transform: 'scale(1.02)',
                                    },
                                }}
                                onClick={() => handleCardClick(shop.id, shop.type)}
                            >
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={shop.image}
                                    alt={shop.name}
                                    title={shop.name}
                                    sx={{
                                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                                    }}
                                    loading="eager"
                                    decoding="async"
                                />
                                <CardContent>
                                    <Typography
                                        gutterBottom
                                        variant="h6"
                                        component="div"
                                        sx={{
                                            color: '#4d4d33',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        <Tooltip title={shop.name}>
                                            <span
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 1,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxHeight: '3em', // Adjust if needed
                                                    lineHeight: '1.5em',
                                                }}
                                            >
                                                {shop.name}
                                            </span>
                                        </Tooltip>
                                    </Typography>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                        <Star style={{ color: '#32d032', marginRight: '5px', fontSize: '20px' }} />
                                        <Typography variant="body2" color="textSecondary" style={{ lineHeight: '24px' }}>
                                            {shop.rating} •{" "}
                                            <AccessTime
                                                style={{
                                                    marginRight: '5px',
                                                    fontSize: '20px',
                                                    verticalAlign: 'sub',
                                                }}
                                            />
                                            <Tooltip title={shop.time}>
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        maxWidth: '100px', // or any fixed width you prefer
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        verticalAlign: 'middle',
                                                        cursor: 'help',
                                                    }}
                                                >
                                                    {shop.time}
                                                </span>
                                            </Tooltip>
                                        </Typography>
                                    </div>
                                    <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                                        <Tooltip title={shop.description} arrow>
                                            <span
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 1,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    lineHeight: '1.5em',
                                                    maxHeight: '3em', // 2 lines × 1.5em
                                                }}
                                            >
                                                {shop.description}
                                            </span>
                                        </Tooltip>
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                        <Tooltip title={shop.location} arrow>
                                            <span
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    lineHeight: '1.5em',
                                                    maxHeight: '3em', // 2 lines * 1.5em
                                                }}
                                            >
                                                {shop.location}
                                            </span>
                                        </Tooltip>

                                    </Typography>
                                </CardContent>
                            </Card>
                        </div>
                    ))
                )}
            </Slider>
        </Container>
    );
};

function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{
                ...style,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '30px',
                height: '30px',
                background: '#bdbdbd',
                borderRadius: '50%',
                zIndex: 1,
            }}
            onClick={onClick}
        />
    );
}

function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{
                ...style,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '30px',
                height: '30px',
                background: '#bdbdbd',
                borderRadius: '50%',
                zIndex: 1,
            }}
            onClick={onClick}
        />
    );
}

export default RecommendShop;
