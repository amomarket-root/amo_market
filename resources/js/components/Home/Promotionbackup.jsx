import React, { useRef, useEffect, useState } from 'react';
import { Container, Card, useMediaQuery, Skeleton } from '@mui/material';
import { styled, useTheme } from '@mui/system';
import Slider from 'react-slick';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    boxShadow: 'none',
    textAlign: 'center',
    margin: '0 8px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    height: 300,
    [theme.breakpoints.down('sm')]: {
        height: 200,
    },
}));

const Promotion = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const apiUrl = import.meta.env.VITE_API_URL;

    const sliderRef = useRef();
    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRefs = useRef([]);

    // Fetch promotions
    const { data: promotions, isLoading, isError } = useQuery({
        queryKey: ['promotions'],
        queryFn: async () => {
            const response = await axios.get(`${apiUrl}/portal/promotions`);
            return response.data.data;
        },
        staleTime: 1000 * 60 * 20,
    });

    // Slide to next video once current ends
    const handleVideoEnd = () => {
        if (sliderRef.current && promotions?.length) {
            const nextIndex = (currentIndex + 1) % promotions.length;
            setCurrentIndex(nextIndex);
            sliderRef.current.slickGoTo(nextIndex);
        }
    };

    useEffect(() => {
        const currentVideo = videoRefs.current[currentIndex];
        if (currentVideo) {
            currentVideo.currentTime = 0;
            currentVideo.play().catch(() => {});
        }
    }, [currentIndex, promotions]);

    const settings = {
        dots: false,
        arrows: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false,
        draggable: false,
        swipe: false,
        beforeChange: (_, next) => setCurrentIndex(next),
    };

    return (
        <Container
            sx={{ maxWidth: '100%', marginTop: '20px', overflowX: 'hidden', padding: '0px' }}
            maxWidth={false}
        >
            {isLoading || isError || !promotions?.length ? (
                <StyledCard>
                    <Skeleton variant="rectangular" width="100%" height={isMobile ? 200 : 300} />
                </StyledCard>
            ) : (
                <Slider ref={sliderRef} {...settings}>
                    {promotions.map((promotion, index) => (
                        <div key={index}>
                            <StyledCard>
                                <video
                                    ref={(el) => (videoRefs.current[index] = el)}
                                    src={promotion.video_url}
                                    muted
                                    autoPlay={index === 0}
                                    playsInline
                                    controls={false}
                                    onEnded={handleVideoEnd}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: theme.spacing(2),
                                    }}
                                />
                            </StyledCard>
                        </div>
                    ))}
                </Slider>
            )}
        </Container>
    );
};

export default Promotion;
