import React from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';

const TipSection = ({ tipAmount, setTipAmount }) => {
    return (
        <Box sx={{ mt: 2, backgroundColor: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Tip your delivery partner
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Your kindness means a lot! 100% of your tip will go directly to your delivery partner.
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Button
                    variant="outlined"
                    sx={{
                        width: '20%',
                        backgroundColor: '#8b50f2',
                        color: '#fff',
                        borderColor: '#8b50f2',
                        '&:hover': {
                            backgroundColor: '#5a1bcc',
                            borderColor: '#5a1bcc',
                        },
                    }}
                    onClick={() => {
                        if (tipAmount === 20) {
                            setTipAmount(0);
                        } else {
                            setTipAmount(20);
                        }
                    }}
                >
                    ₹20
                </Button>
                <Button
                    variant="outlined"
                    sx={{
                        width: '20%',
                        backgroundColor: '#8b50f2',
                        color: '#fff',
                        borderColor: '#8b50f2',
                        '&:hover': {
                            backgroundColor: '#5a1bcc',
                            borderColor: '#5a1bcc',
                        },
                    }}
                    onClick={() => {
                        if (tipAmount === 30) {
                            setTipAmount(0);
                        } else {
                            setTipAmount(30);
                        }
                    }}
                >
                    ₹30
                </Button>
                <Button
                    variant="outlined"
                    sx={{
                        width: '20%',
                        backgroundColor: '#8b50f2',
                        color: '#fff',
                        borderColor: '#8b50f2',
                        '&:hover': {
                            backgroundColor: '#5a1bcc',
                            borderColor: '#5a1bcc',
                        },
                    }}
                    onClick={() => {
                        if (tipAmount === 50) {
                            setTipAmount(0);
                        } else {
                            setTipAmount(50);
                        }
                    }}
                >
                    ₹50
                </Button>
                <Button
                    variant="outlined"
                    sx={{
                        width: '20%',
                        backgroundColor: '#8b50f2',
                        color: '#fff',
                        borderColor: '#8b50f2',
                        '&:hover': {
                            backgroundColor: '#5a1bcc',
                            borderColor: '#5a1bcc',
                        },
                    }}
                    onClick={() => {
                        if (tipAmount === 100) {
                            setTipAmount(0);
                        } else {
                            setTipAmount(100);
                        }
                    }}
                >
                    ₹100
                </Button>
            </Box>
        </Box>
    );
};

export default TipSection;
