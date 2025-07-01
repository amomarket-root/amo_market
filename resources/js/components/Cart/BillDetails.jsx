import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import MopedTwoToneIcon from '@mui/icons-material/MopedTwoTone';
import PhonelinkTwoToneIcon from '@mui/icons-material/PhonelinkTwoTone';
import VolunteerActivismTwoToneIcon from '@mui/icons-material/VolunteerActivismTwoTone';
import PersonTwoToneIcon from '@mui/icons-material/PersonTwoTone';

const BillDetails = ({ totalAmount, deliveryCharge, platformCharge, feedingIndiaDonation, tipAmount, grandTotal }) => {
    return (
        <Box sx={{ mt: 2, backgroundColor: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Bill details</Typography>
            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DescriptionTwoToneIcon sx={{ mr: 0.5 }} />
                    <Typography variant="body2">Items total</Typography>
                </Box>
                <Typography variant="body2">₹{totalAmount}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MopedTwoToneIcon sx={{ mr: 0.5 }} />
                    <Typography variant="body2">Delivery charge</Typography>
                </Box>
                <Typography variant="body2">₹{deliveryCharge}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhonelinkTwoToneIcon sx={{ mr: 0.5 }} />
                    <Typography variant="body2">Platform charge</Typography>
                </Box>
                <Typography variant="body2">₹{platformCharge}</Typography>
            </Box>

            {feedingIndiaDonation === 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <VolunteerActivismTwoToneIcon sx={{ mr: 0.5 }} />
                        <Typography variant="body2">Feeding India</Typography>
                    </Box>
                    <Typography variant="body2">₹1</Typography>
                </Box>
            )}

            {tipAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonTwoToneIcon sx={{ mr: 0.5 }} />
                        <Typography variant="body2">Tip for your delivery Partner</Typography>
                    </Box>
                    <Typography variant="body2">₹{tipAmount}</Typography>
                </Box>
            )}

            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>Grand total</Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>₹{grandTotal}</Typography>
            </Box>
        </Box>
    );
};

export default BillDetails;
