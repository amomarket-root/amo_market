import React from 'react';
import { Card, CardContent, Grid, Typography, Box, Divider, Avatar, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import DeliveryScooterIcon from '@mui/icons-material/ElectricScooter';

const DeliveryDetailsCard = ({ cartUserAddress }) => {
    return (
        <Card sx={{ mb: 2, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)", borderRadius: 4 }}>
            <CardContent>
                <Grid container alignItems="center" spacing={1}>
                    <Grid item>
                        <Avatar sx={{ bgcolor: "#f0f4ff" }}>
                            <DeliveryScooterIcon color="primary" />
                        </Avatar>
                    </Grid>
                    <Grid item xs>
                        <Typography variant="h6" fontWeight="bold">
                            Your delivery details
                        </Typography>
                        <Typography color="textSecondary">
                            Details of your current order
                        </Typography>
                    </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Grid container alignItems="flex-start" spacing={1}>
                    <Grid item>
                        <Avatar sx={{ bgcolor: "#e6f7e6" }}>
                            <LocationOnIcon color="success" />
                        </Avatar>
                    </Grid>
                    <Grid item xs>
                        <Typography fontWeight="bold">Delivery at Home</Typography>
                        <Typography color="textSecondary" noWrap>
                            {cartUserAddress?.building_details
                                ? cartUserAddress.building_details.slice(0, 35) + (cartUserAddress.building_details.length > 35 ? "..." : "")
                                : ""}
                        </Typography>
                        <Typography color="primary" fontSize="small" sx={{ mt: 0.5 }}>
                            Change address
                        </Typography>
                    </Grid>
                </Grid>
                <Box sx={{ bgcolor: "#fff8e6", p: 1.5, mt: 1, borderRadius: 1, display: "flex", alignItems: "center" }}>
                    <Typography color="textSecondary" fontSize="small" sx={{ flexGrow: 1 }}>
                        Now update your address effortlessly if you've ordered at an incorrect location
                    </Typography>
                    <Button variant="contained" size="small" sx={{ ml: 1 }}>
                        OK
                    </Button>
                </Box>
                <Grid container alignItems="flex-start" spacing={1} sx={{ mt: 1 }}>
                    <Grid item>
                        <Avatar sx={{ bgcolor: "#e6f7e6" }}>
                            <PhoneIcon color="success" />
                        </Avatar>
                    </Grid>
                    <Grid item xs>
                        <Typography fontWeight="bold">
                            {cartUserAddress?.full_name},{" "}
                            {cartUserAddress?.phone_number
                                ? cartUserAddress.phone_number.slice(0, -4) + "XXXX"
                                : ""}
                        </Typography>
                        <Typography color="primary" fontSize="small" sx={{ mt: 0.5 }}>
                            Update receiver's contact
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default DeliveryDetailsCard;
