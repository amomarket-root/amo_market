import React, { useState } from "react";
import { Container, Typography, Box, IconButton, Grid, Paper } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const AccountPrivacy = () => {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    return (
        <Container sx={{ maxWidth: '100%', padding: '0px', mt: 0 }} maxWidth={false}>
            <Box sx={{ padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', ml: -3 }}>
                <IconButton onClick={() => window.history.back()}>
                    <ArrowBackIcon fontSize="large" color="#9F63FF" />
                </IconButton>
                <Typography variant="h5" sx={{ color: "#646363" }} fontWeight="bold">
                    Account privacy & policy
                </Typography>
            </Box>

            <Paper elevation={3} sx={{ p: 2, mt: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    We i.e. <b>"Amo Market Private Limited"</b>, are committed to
                    protecting the privacy and security of your personal information.
                    Your privacy is important to us and maintaining your trust is
                    paramount.
                </Typography>

                {expanded && (
                    <Typography variant="body2" color="text.secondary" mt={2}>
                        This privacy policy explains how we collect, use, process, and disclose information about you.
                        By using our website/app/platform and affiliated services, you consent to the terms of our privacy
                        policy (“Privacy Policy”) in addition to our ‘Terms of Use.’ We encourage you to read this privacy
                        policy to understand the collection, use, and disclosure of your information from time to time, to
                        keep yourself updated with the changes and updates that we make to this policy. This privacy policy
                        describes our privacy practices for all websites, products, and services that are linked to it.
                        However, this policy does not apply to those affiliates and partners that have their own privacy
                        policy. In such situations, we recommend that you read the privacy policy on the applicable site.
                        Should you have any clarifications regarding this privacy policy, please write to us at
                        <b> info@amomarket.com</b>.
                    </Typography>
                )}

                <Typography
                    variant="body2"
                    color="primary"
                    mt={1}
                    sx={{ cursor: "pointer" }}
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? "Read less ▲" : "Read more ▼"}
                </Typography>
            </Paper>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    marginTop: "10px",
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DeleteOutlineIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                        <Typography variant="body1" fontWeight="bold">
                            Request to delete account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Request to closure of your account
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={() => navigate("/account/delete-account")}>
                    <ArrowForwardIosIcon />
                </IconButton>
            </Box>
        </Container>
    );
};

export default AccountPrivacy;
