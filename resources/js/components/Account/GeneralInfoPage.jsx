import React from "react";
import { Container, Grid, Typography, Paper, Box, IconButton } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UpdateIcon from '@mui/icons-material/Update';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const GeneralInfoPage = () => {
    return (
        <Container sx={{ maxWidth: '100%', padding: '0px', mt: 0 }} maxWidth={false}>
            <Box sx={{ padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', ml: -3 }}>
                <IconButton onClick={() => window.history.back()} >
                    <ArrowBackIcon fontSize="large" color="#9F63FF" />
                </IconButton>
                <Typography variant="h5" sx={{ color: "#646363" }} fontWeight="bold">
                    General Information
                </Typography>
            </Box>
            <Paper elevation={5} sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} sx={{ display: "flex", alignItems: "center" }}>
                        <UpdateIcon sx={{ color: "#f27474", mr: 1 }} />
                        <Typography variant="h5" sx={{ color: "#f27474" }} fontWeight="bold" gutterBottom>
                            Amo Market(Beta V1)
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ display: "flex", alignItems: "center" }}>
                        <UpdateIcon sx={{ color: "#FF9800", mr: 1 }} />
                        <Typography variant="body1">
                            We are continuously improving our application to provide a seamless and enhanced shopping experience for our users. Our team is dedicated to optimizing performance, introducing new features, and ensuring that every interaction within the platform is smooth and efficient. We value your feedback and are committed to making consistent improvements to meet your expectations.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ display: "flex", alignItems: "center" }}>
                        <PhoneAndroidIcon sx={{ color: "#4CAF50", mr: 1 }} />
                        <Typography variant="body1">
                            At the same time, we are actively working on the development of both Android and iOS versions of the application. Our goal is to ensure that customers can access Amo Market effortlessly from any device, allowing for a more convenient and enjoyable shopping experience. Stay tuned for future updates as we expand our reach and introduce more enhancements.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ display: "flex", alignItems: "center" }}>
                        <ThumbUpIcon sx={{ color: "#2196F3", mr: 1 }} />
                        <Typography variant="body1">
                            Thank you for supporting us! Your encouragement and feedback motivate us to push forward and deliver the best possible service. We appreciate your trust and look forward to bringing you even more exciting features and improvements in the near future.
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default GeneralInfoPage;
