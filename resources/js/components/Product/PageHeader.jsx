import React from 'react';
import { Typography, Box, Skeleton } from '@mui/material';
import { styled } from '@mui/system';

const ResponsiveHeaderBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '5px',
    marginTop: '24px',
    marginBottom: '16px',
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px',
    },
}));

const PageHeader = ({ title, loading, children }) => {
    return (
        <ResponsiveHeaderBox>
            {loading ? (
                <Skeleton variant="text" width={320} height={40} />
            ) : (
                title && (
                    <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                        {title}
                    </Typography>
                )
            )}
            {children}
        </ResponsiveHeaderBox>
    );
};

export default PageHeader;
