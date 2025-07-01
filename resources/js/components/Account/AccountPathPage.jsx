import React from 'react';
import { Route, Routes, Outlet } from 'react-router-dom';
import AccountContentMenu from './AccountContentMenu';
import { Typography } from '@mui/material';

// Define the routes for the content
const contentRoutes = [
    { path: '/order-history', component: <Typography>Order History Content</Typography> },
    { path: '/address-book', component: <Typography>Address Book Content</Typography> },
    { path: '/wallet-details', component: <Typography>Wallet Details Content</Typography> },
    { path: '/account-privacy', component: <Typography>Account Privacy Content</Typography> },
    { path: '/customer-support-&-faq', component: <Typography>Customer Support & FAQ Content</Typography> },
    { path: '/refunds', component: <Typography>Refunds Content</Typography> },
    { path: '/general-info', component: <Typography>General Info Content</Typography> },
    { path: '/notification', component: <Typography>Notification Content</Typography> },
    { path: '/logout', component: <Typography>Logout Content</Typography> },
];

const AccountPathPage = () => {
    return (
        <Routes>
            <Route path="/" element={<AccountContentMenu />}>
                {contentRoutes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={route.component}
                    />
                ))}
                <Route path="*" element={<Typography>404 - Not Found</Typography>} />
            </Route>
        </Routes>
    );
};

export default AccountPathPage;
