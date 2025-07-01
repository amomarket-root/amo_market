import React from 'react';
import { Skeleton } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled('div')({
    height: '280px',
    display: 'flex',
    margin: '8px 4px',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    minWidth: '200px',
});

const ScrollContainer = styled('div')({
    display: 'flex',
    overflowX: 'auto',
    paddingBottom: '10px',
    position: 'relative',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
        display: 'none',
    },
});

const LoadingSkeleton = () => {
    return (
        <div style={{ marginBottom: '30px', position: 'relative' }}>
            <Skeleton variant="text" width="40%" height={40} style={{ marginBottom: '10px' }} />
            <ScrollContainer>
                {Array.from(new Array(10)).map((_, idx) => (
                    <StyledCard key={idx}>
                        <Skeleton variant="rectangular" height={120} />
                        <div style={{ padding: '10px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Skeleton variant="text" height={24} width="80%" />
                            <Skeleton variant="text" height={20} width="60%" />
                            <Skeleton variant="text" height={20} width="60%" />
                            <Skeleton variant="text" height={36} width="50%" style={{ marginTop: '8px' }} />
                        </div>
                    </StyledCard>
                ))}
            </ScrollContainer>
        </div>
    );
};

export default LoadingSkeleton;
