import React from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';

const TipSection = ({ tipAmount, setTipAmount }) => {
    const tips = [20, 30, 50, 100];

    return (
        <Box
            sx={{
                mt: 2,
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
            }}
        >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Tip your delivery partner
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Your kindness means a lot! 100% of your tip will go directly to your delivery partner.
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 1,
                }}
            >
                {tips.map((amount) => (
                    <Button
                        key={amount}
                        variant={tipAmount === amount ? 'contained' : 'outlined'}
                        sx={{
                            width: '20%',
                            color: tipAmount === amount ? '#fff' : 'primary.main',
                            backgroundColor: tipAmount === amount ? 'primary.main' : 'transparent',
                            '&:hover': {
                                backgroundColor: tipAmount === amount ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
                            },
                        }}
                        onClick={() => {
                            if (tipAmount === amount) {
                                setTipAmount(0);
                            } else {
                                setTipAmount(amount);
                            }
                        }}
                    >
                        ₹{amount}
                    </Button>
                ))}
            </Box>
        </Box>
    );
};

export default TipSection;
