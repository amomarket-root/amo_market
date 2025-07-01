import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    List,
    ListItem,
    Container,
    IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import SendIcon from '@mui/icons-material/Send';

const ChatSupportPage = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;
    const userId = localStorage.getItem("user_id");
    const messagesEndRef = useRef(null);

    // Fetch messages when the component mounts
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`${apiUrl}/portal/customer_messages`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("portal_token")}`,
                        "Content-Type": "application/json",
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data.messages);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();

        // Set up the event listener for real-time updates
        window.Echo.channel(`support_chat.${userId}`)
            .listen('.message.sent', (data) => {
                setMessages((prevMessages) => [...prevMessages, data.message]);
            });

        // Clean up the event listener when the component unmounts
        return () => {
            window.Echo.leave(`support_chat.${userId}`);
        };
    }, [apiUrl, userId]);

    // Send message to the server
    const sendMessage = async () => {
        if (!message.trim()) return;

        try {
            const response = await fetch(`${apiUrl}/portal/customer_send_message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("portal_token")}`,
                },
                body: JSON.stringify({ receiver_id: "super-admin", message, type: "text" }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages([...messages, data.data]);
                setMessage("");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Scroll to the bottom of the chat when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <Container sx={{ maxWidth: '100%', padding: '0px', mt: 0 }} maxWidth={false}>
            <Box sx={{ padding: 1, display: "flex", alignItems: "center", justifyContent: "flex-start", ml: -3 }}>
                <IconButton onClick={() => window.history.back()}>
                    <ArrowBackIcon fontSize="large" sx={{ color: "#9F63FF" }} />
                </IconButton>
                <Typography variant="h5" sx={{ color: "#646363" }} fontWeight="bold">
                    Chat Support
                </Typography>
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#646363" }}>
                Chat with us...
            </Typography>

            <Paper sx={{ p: 1, height: "500px", overflowY: "auto", mb: 2, boxShadow: 5 }}>
                <List>
                    {messages.map((msg, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                display: "flex",
                                justifyContent: msg.sender_id === userId ? "flex-end" : "flex-start",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: msg.sender_id === userId ? "flex-end" : "flex-start",
                                    maxWidth: "70%",
                                }}
                            >
                                <Paper
                                    elevation={3}
                                    sx={{
                                        p: 1,
                                        mb: 0.5,
                                        backgroundColor: msg.sender_id === userId ? "#e3f2fd" : "#f5f5f5",
                                        borderRadius: msg.sender_id === userId ? "20px 20px 0 20px" : "20px 20px 20px 0",
                                    }}
                                >
                                    <Typography variant="body1">{msg.message}</Typography>
                                </Paper>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <CheckCircleIcon fontSize="small" sx={{ color: "#4caf50" }} />
                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                        {msg.sender_id === userId ? "You" : "Supporter"}
                                    </Typography>
                                </Box>
                            </Box>
                        </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                </List>
            </Paper>

            <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <Button variant="contained" onClick={sendMessage} endIcon={<SendIcon />}>
                    Send
                </Button>
            </Box>
        </Container>
    );
};

export default ChatSupportPage;
