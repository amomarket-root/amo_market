import React from 'react';
import { Box, Paper, IconButton, Skeleton } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const ProductImages = ({
  mainImage,
  images,
  loading,
  isMobile,
  visibleImages,
  handleThumbnailClick,
  handleNext,
  handlePrev
}) => {
  return (
    <Paper
      elevation={4}
      sx={{
        position: 'relative',
        padding: '16px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {loading ? (
        <Skeleton variant="rectangular" width={isMobile ? 300 : 420} height={370} />
      ) : (
        <img
          src={mainImage}
          alt="Main Product"
          style={{
            width: isMobile ? '300px' : '320px',
            height: '370px',
            objectFit: 'cover',
            borderRadius: '4px',
            display: 'block',
            margin: 'auto',
          }}
          loading="eager"
          decoding="async"
        />
      )}
      <Box mt={2} position="relative" sx={{ overflow: 'hidden', width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {Array.from(new Array(5)).map((_, index) => (
              <Skeleton key={index} variant="rectangular" width={80} height={80} />
            ))}
          </Box>
        ) : (
          <>
            {visibleImages > 0 && (
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <ArrowBack />
              </IconButton>
            )}
            <Box
              sx={{
                display: 'flex',
                overflow: 'hidden',
                width: '100%',
                padding: '4px',
                boxSizing: 'border-box',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  transition: 'transform 0.3s ease-in-out',
                  transform: `translateX(-${visibleImages * 108}px)`,
                }}
              >
                {images.map((img, index) => (
                  <Box
                    key={index}
                    sx={{
                      minWidth: '80px',
                      height: '80px',
                      marginRight: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        border: '1px solid #333',
                      },
                    }}
                    onClick={() => handleThumbnailClick(img)}
                  >
                    <img
                      src={img}
                      alt={`sub-${index}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      loading="eager"
                      decoding="async"
                    />
                  </Box>
                ))}
              </Box>
            </Box>
            {visibleImages < images.length - 5 && (
              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <ArrowForward />
              </IconButton>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
};

export default ProductImages;
