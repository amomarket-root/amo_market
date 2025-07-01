import React from 'react';
import { Card, CardContent, Grid, Typography, Avatar, IconButton, Skeleton } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const HelpCard = ({ loading }) => {
    return (
        <Card sx={{ mb: 2, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)", borderRadius: 4 }}>
            <CardContent>
                {loading ? (
                    <Grid container alignItems="center" spacing={1}>
                        <Grid item>
                            <Skeleton variant="circular" width={40} sx={{ borderRadius: 4 }} height={40} />
                        </Grid>
                        <Grid item xs>
                            <Skeleton variant="text" width="70%" sx={{ borderRadius: 4 }} height={24} />
                            <Skeleton variant="text" width="50%" sx={{ borderRadius: 4 }} height={20} />
                        </Grid>
                        <Grid item>
                            <Skeleton variant="circular" width={40} sx={{ borderRadius: 4 }} height={40} />
                        </Grid>
                    </Grid>
                ) : (
                    <Grid container alignItems="center" spacing={1}>
                        <Grid item>
                            <Avatar sx={{ bgcolor: "#f4f9ff" }}>
                                <ChatBubbleOutlineIcon color="primary" />
                            </Avatar>
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h6" fontWeight="bold">
                                Need help?
                            </Typography>
                            <Typography color="textSecondary" fontSize="small">
                                Chat with us about any issue related to your order
                            </Typography>
                        </Grid>
                        <Grid item>
                            <IconButton>
                                <ChatBubbleOutlineIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                )}
            </CardContent>
        </Card>
    );
};

export default HelpCard;
