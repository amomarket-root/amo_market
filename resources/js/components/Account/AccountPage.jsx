import React from 'react';
import Box from '@mui/material/Box';
import AccountContentMenu from './AccountContentMenu';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLocation, Outlet } from 'react-router-dom';

const AccountPage = () => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const location = useLocation();

    return (
        <Box>
            {(!isMobile || location.pathname === '/account') && <AccountContentMenu />}
            {isMobile && location.pathname !== '/account' ? (
                <Outlet />
            ) : (
                !isMobile && (
                    <Box sx={{ marginLeft: '25%', padding: '20px', backgroundColor: '#f9f9f9' }}>
                        {location.pathname === '/account' && (
                            <></>
                        )}
                    </Box>
                )
            )}
        </Box>
    );
};

export default AccountPage;
