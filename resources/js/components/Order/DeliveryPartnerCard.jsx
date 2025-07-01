import React from 'react';
import { Card, CardContent, Grid, Typography, Box, IconButton } from '@mui/material';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PhoneIcon from '@mui/icons-material/Phone';

const DeliveryPartnerCard = ({ deliveryPartner }) => {
    return (
        <Card sx={{ mb: 1, borderRadius: 2, overflow: "hidden" }}>
            <CardContent>
                <Grid container spacing={1} alignItems="center">
                    <Grid item>
                        <DirectionsBikeIcon color="error" sx={{ fontSize: 30 }} />
                    </Grid>
                    <Grid item xs>
                        <Typography variant="h6">
                            Your Delivery partner is
                            <span style={{ color: "#f27474", fontWeight: "bold" }}>
                                {" "} {deliveryPartner?.name} {" "}
                            </span>
                            coming with {deliveryPartner?.delivery_mode} vehicle number :
                            <span style={{ color: "#0f85d9", fontWeight: "bold" }}>
                                {" "} {deliveryPartner?.vehicle_number} {" "}
                            </span>.
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1">
                                <strong>Partner Number:</strong> {deliveryPartner?.number}
                            </Typography>
                            <IconButton
                                color="success"
                                onClick={() => window.location.href = `tel:${deliveryPartner?.number}`}
                                sx={{ border: "1px solid", borderColor: "success" }}
                            >
                                <PhoneIcon />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default DeliveryPartnerCard;
