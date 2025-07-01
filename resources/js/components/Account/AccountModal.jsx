import React from 'react';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Slide from '@mui/material/Slide';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Location from '../Location';
import { Assignment, LocationOn, AccountBalanceWallet, Lock, ExitToApp, Support, AttachMoney, Info, Notifications } from '@mui/icons-material';

// Slide transition for the full-screen dialog
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const handleLocationSelect = (description) => {
    // Handle the location selection logic
};

const AccountModal = ({ open, onClose, onBack }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));


    return (
        <>
            {/* Full-Screen Dialog for Account */}
            <Dialog
                fullScreen
                open={open}
                onClose={onClose}
                TransitionComponent={Transition}
            >
                {/* AppBar with back and close buttons */}
                <AppBar
                    sx={{
                        position: 'relative',
                        backgroundColor: '#fff',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                        //backdropFilter: 'blur(10px)',
                        color: 'transparent',
                        borderBottomLeftRadius: '20px', // Rounded corner for the bottom-left
                        borderBottomRightRadius: '20px', // Rounded corner for the bottom-right
                        overflow: 'hidden', // Ensure radius applies correctly
                    }}
                >
                    <Toolbar style={{ marginBottom: 10, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
                        <Box sx={{ flexGrow: 1 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={isMobile ? 6 : "auto"}>
                                    <Box display="flex" alignItems="center">
                                        {!isMobile && (
                                            <Typography
                                                variant="h5"
                                                noWrap
                                                style={{ fontWeight: "bold", color: "#2EDF0F" }}
                                            >
                                                Amo
                                                <span style={{ color: "#7528FA" }}> Market</span>
                                            </Typography>
                                        )}
                                        <Grid item xs={isMobile ? 6 : "auto"} display="flex" justifyContent="flex-end">
                                            {isMobile && (
                                                <IconButton
                                                    edge="end"
                                                    color="inherit"
                                                    onClick={onClose}
                                                    aria-label="close"
                                                    sx={{ color: '#5b5858',marginTop:1,marginRight:0.5 }}
                                                >
                                                    <ArrowBackIcon />
                                                </IconButton>
                                            )}
                                        </Grid>
                                        <Location
                                            style={{ color: "#000", cursor: "pointer", marginLeft: !isMobile ? 20 : 0 }}
                                            onLocationSelect={handleLocationSelect}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                        {/* The section that only displays on larger screens */}
                        {!isMobile && (
                            <>
                                <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
                                    <IconButton
                                        edge="end"
                                        color="inherit"
                                        onClick={onClose}
                                        aria-label="close"
                                        sx={{ color: '#ff5722' }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </div>
                            </>
                        )}
                    </Toolbar>
                </AppBar>

                {/* Content of the Dialog */}
                <div style={{ padding: '20px', backgroundColor: '#fff' }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Your Information
                    </Typography>

                    <List>
                        {/* Order History */}
                        <ListItem button sx={{ borderRadius: 3 }}>
                            <ListItemIcon>
                                <Assignment style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: '50%' }} />
                            </ListItemIcon>
                            <ListItemText primary="Order History" />
                        </ListItem>

                        {/* Address Book */}
                        <ListItem button sx={{ borderRadius: 3 }}>
                            <ListItemIcon>
                                <LocationOn style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: '50%' }} />
                            </ListItemIcon>
                            <ListItemText primary="Address Book" />
                        </ListItem>

                        {/* Wallet Details */}
                        <ListItem button sx={{ borderRadius: 3 }}>
                            <ListItemIcon>
                                <AccountBalanceWallet style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: '50%' }} />
                            </ListItemIcon>
                            <ListItemText primary="Wallet Details" />
                        </ListItem>

                        {/* Account Privacy */}
                        <ListItem button sx={{ borderRadius: 3 }}>
                            <ListItemIcon>
                                <Lock style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: '50%' }} />
                            </ListItemIcon>
                            <ListItemText primary="Account Privacy" />
                        </ListItem>

                        {/* Customer Support & FAQ */}
                        <ListItem button sx={{ borderRadius: 3 }}>
                            <ListItemIcon>
                                <Support style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: '50%' }} />
                            </ListItemIcon>
                            <ListItemText primary="Customer Support & FAQ" />
                        </ListItem>

                        {/* Refunds */}
                        <ListItem button sx={{ borderRadius: 3 }}>
                            <ListItemIcon>
                                <AttachMoney style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: '50%' }} />
                            </ListItemIcon>
                            <ListItemText primary="Refunds" />
                        </ListItem>

                        {/* General Info */}
                        <ListItem button sx={{ borderRadius: 3 }}>
                            <ListItemIcon>
                                <Info style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: '50%' }} />
                            </ListItemIcon>
                            <ListItemText primary="General Info" />
                        </ListItem>

                        {/* Notification */}
                        <ListItem button sx={{ borderRadius: 3 }}>
                            <ListItemIcon>
                                <Notifications style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: '50%' }} />
                            </ListItemIcon>
                            <ListItemText primary="Notification" />
                        </ListItem>

                        <Divider />

                        {/* Logout */}
                        <ListItem button sx={{ borderRadius: 3 }}>
                            <ListItemIcon>
                                <ExitToApp style={{ backgroundColor: '#f5f5f5', padding: 10, borderRadius: '50%' }} />
                            </ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItem>
                    </List>
                </div>
            </Dialog>
        </>
    );
};

export default AccountModal;
