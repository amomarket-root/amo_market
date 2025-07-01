import React, { useState } from "react";
import {
    Box, Container, Typography, List, ListItem, ListItemText, ListItemButton,
    IconButton, Divider, TextField, Button
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSweetAlert } from '../Theme/SweetAlert';

const DeleteAccountPage = () => {
    const showAlert = useSweetAlert();
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [selectedReason, setSelectedReason] = useState("");
    const apiUrl = import.meta.env.VITE_API_URL;

    const reasons = [
        "I don't want to use Amo Market anymore",
        "I'm using a different account",
        "I'm worried about my privacy",
        "You are sending me too many emails/notifications",
        "This website is not working properly",
        "Other",
    ];

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
        setSelectedReason(reasons[index]);
    };

    const handleFeedbackChange = (event) => {
        setFeedback(event.target.value);
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await axios.post(`${apiUrl}/portal/delete-account`, {
                reason: selectedReason,
                feedback: feedback,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('portal_token')}`,
                }
            });

            if (response.status === 200) {
                showAlert({
                    icon: "success",
                    title: "Your account has been deleted successfully.",
                    text: "Please wait, You will be redirected to home page.",
                    showConfirmButton: true,
                    timer: 5000,
                    timerProgressBar: true,
                    confirmButtonText: "OK",
                }).then(() => {
                    localStorage.clear(); // Clear local storage
                    navigate('/'); // Redirect to Home page
                });
            }
        } catch (error) {
            showAlert({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "An error occurred while deleting your account.",
                showConfirmButton: true,
                confirmButtonText: "OK",
            });
        }
    };

    return (
        <Container sx={{ maxWidth: '100%', padding: '0px', mt: 0 }} maxWidth={false}>
            {/* Header */}
            <Box sx={{ padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', ml: -3 }}>
                <IconButton onClick={() => window.history.back()}>
                    <ArrowBackIcon fontSize="large" sx={{ color: "#9F63FF" }} />
                </IconButton>
                <Typography variant="h5" sx={{ color: "#646363" }} fontWeight="bold">
                    Delete Account
                </Typography>
            </Box>

            <Typography variant="h6" fontWeight="bold">
                Delete my account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Why would you like to delete your account?
            </Typography>

            {/* Reasons List */}
            <List sx={{ bgcolor: "background.paper", borderRadius: 3, boxShadow: 1 }}>
                {reasons.map((reason, index) => (
                    <React.Fragment key={index}>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => handleToggle(index)}>
                                <ListItemText primary={reason} />
                                {openIndex === index ? (
                                    <KeyboardArrowDownIcon fontSize="small" />
                                ) : (
                                    <ArrowForwardIosIcon fontSize="small" />
                                )}
                            </ListItemButton>
                        </ListItem>
                        {openIndex === index && (
                            <Box sx={{ p: 1, bgcolor: "#f9f9f9", borderRadius: 2 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    placeholder="Please share your feedback (Optional)"
                                    variant="outlined"
                                    value={feedback}
                                    onChange={handleFeedbackChange}
                                />
                                <Button
                                    fullWidth
                                    sx={{ mt: 2, bgcolor: "#f27474", color: "white", fontWeight: "bold", textTransform: "none" }}
                                    onClick={handleDeleteAccount}
                                >
                                    Delete my account
                                </Button>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                    Note*: All data associated with this account will be deleted in accordance with our privacy policy. You will not be able to retrieve this information once deleted.
                                </Typography>
                            </Box>
                        )}
                        {index !== reasons.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>
        </Container>
    );
};

export default DeleteAccountPage;
