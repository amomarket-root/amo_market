import React, { useEffect, useState } from "react";
import { Menu, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, InputAdornment, CircularProgress, Avatar, Box, Autocomplete, Chip, Grid } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useSweetAlert } from '../Theme/SweetAlert';
import { useNavigate } from "react-router-dom";

const MenuSection = ({ anchorEl, isMenuOpen, handleMenuClose, apiUrl, fetchAvatar }) => {
    const navigate = useNavigate();
    const showAlert = useSweetAlert();
    const [oldPasswordError, setOldPasswordError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [viewProfileOpen, setViewProfileOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [passwordFormData, setPasswordFormData] = useState({
        old_password: "",
        password: "",
        password_confirmation: ""
    });
    const [showPassword, setShowPassword] = useState({
        old_password: false,
        password: false,
        password_confirmation: false
    });
    const [profileData, setProfileData] = useState(null);
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [roles, setRoles] = useState([]);
    const [roleName, setRoleName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("/image/portal/avatar.png");
    const [avatarId, setAvatarId] = useState(null);
    const [selectedAvatarId, setSelectedAvatarId] = useState(null);

    const [nameError, setNameError] = useState("");
    const [roleNameError, setRoleNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [avatarError, setAvatarError] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [avatarList, setAvatarList] = useState([]);
    const [scrollIndex, setScrollIndex] = useState(0);

    const handleProfileUpdate = () => {
        setNameError('');
        setRoleNameError('');
        setEmailError('');
        setAvatarError('');
        setLoading(true);

        const auth_token = localStorage.getItem('auth_token');
        const formData = new FormData();
        formData.append('user_id', user);
        formData.append('name', name);
        formData.append('role_id', roleName);
        formData.append('email', email);

        if (selectedAvatarId) {
            formData.append('main_avatar', selectedAvatarId); // Pass selected avatar ID
        } else if (avatarFile) {
            formData.append('main_avatar', avatarFile); // Pass uploaded avatar file
        }
        else {
            formData.append('main_avatar', avatarId); // Keep the current avatar
        }

        axios.post(`${apiUrl}/portal/update_profile`, formData, {
            headers: {
                Authorization: `Bearer ${auth_token}`,
            },
        })
            .then(response => {
                const userData = response.data;
                fetchAvatar();
                showAlert({
                    icon: "success",
                    title: "Success!",
                    text: userData.message,
                });
                handleCloseViewProfileDialog();
                navigate('/'); // Adjust the path to where you want to navigate after success
            })
            .catch(error => {
                setLoading(false);
                if (error.response) {
                    if (error.response.data && error.response.data.errors) {
                        if (error.response.data.errors.name) {
                            setNameError(error.response.data.errors.name[0]);
                        }
                        if (error.response.data.errors.role_id) {
                            setRoleNameError(error.response.data.errors.role_id[0]);
                        }
                        if (error.response.data.errors.email) {
                            setEmailError(error.response.data.errors.email[0]);
                        }

                        if (error.response.data.errors.main_avatar) {
                            setAvatarError(error.response.data.errors.main_avatar[0]);
                        }
                    } else if (error.response.data.message) {
                        showAlert({
                            icon: "error",
                            title: "Error!",
                            text: error.response.data.message,
                        });
                    }
                } else {
                    showAlert({
                        icon: "error",
                        title: "Error!",
                        text: 'Server error or network issue. Please try again later.',
                    });
                }
            });
    };

    const handleViewProfile = async () => {
        setViewProfileOpen(true);
        handleMenuClose();
        setLoading(true);
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        try {
            // Fetch user profile and avatars in parallel
            const [profileResponse, avatarsResponse] = await Promise.all([
                axios.get(`${apiUrl}/portal/view_profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }),
                axios.get(`${apiUrl}/admin/avatars`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            ]);

            // Handle profile data
            if (profileResponse.data.status) {
                const userData = profileResponse.data.user;
                setProfileData(userData);
                setUser(userData.id);
                setName(userData.name);
                setRoleName(userData.role_id);
                setEmail(userData.email);
                setAvatarId(userData.avatar_id);
                setAvatar(userData.avatar?.path ?? "/image/portal/avatar.png");
            } else {
                showAlert({
                    icon: "error",
                    title: "Error!",
                    text: 'Failed to fetch profile details.',
                });
            }

            // Handle avatars data
            const avatars = avatarsResponse.data.map((avatar) => ({
                id: avatar.id,
                path: avatar.path
            }));
            setAvatarList(avatars);
        } catch (error) {
            console.error("Error fetching profile:", error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseViewProfileDialog = () => {
        setViewProfileOpen(false);
        setProfileData(null);
    };

    const handleLogout = async () => {
        try {
            const response = await axios.post(
                `${apiUrl}/portal/logout`,
                {},
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("auth_token")}`
                    }
                }
            );

            if (response.status === 200 && response.data.status === true) {
                localStorage.removeItem('avatar');
                localStorage.clear();
                window.location.reload();
                navigate("/");
                showAlert({
                    icon: "success",
                    title: "Success!",
                    text: response.data.message || "Logout successful",
                });
            } else {
                navigate("/login");
            }
        } catch (error) {
            console.error("Logout failed:", error);
            navigate("/login");
        }
        handleMenuClose();
    };

    const handleChangePassword = () => {
        setChangePasswordOpen(true);
        handleMenuClose();
    };

    const handleCloseChangePasswordDialog = () => {
        setChangePasswordOpen(false);
        setPasswordFormData({
            old_password: "",
            password: "",
            password_confirmation: ""
        });
    };

    const handlePasswordFormChange = (event) => {
        const { name, value } = event.target;
        setPasswordFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleToggleShowPassword = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordFormSubmit = () => {
        setOldPasswordError("");
        setPasswordError("");

        const auth_token = localStorage.getItem("auth_token");

        axios
            .post(`${apiUrl}/portal/change_password`, passwordFormData, {
                headers: {
                    Authorization: `Bearer ${auth_token}`
                }
            })
            .then((response) => {
                showAlert({
                    icon: "success",
                    title: "Success!",
                    text: response.data.message,
                });
                handleCloseChangePasswordDialog();
            })
            .catch((error) => {
                if (error.response && error.response.data.errors) {
                    const errors = error.response.data.errors;
                    if (errors.old_password) setOldPasswordError(errors.old_password[0]);
                    if (errors.password) setPasswordError(errors.password[0]);
                } else {
                    showAlert({
                        icon: "error",
                        title: "Error!",
                        text: "Server error or network issue. Please try again later.",
                    });
                }
            });
    };

    const scrollLeft = () => {
        setScrollIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    const scrollRight = () => {
        setScrollIndex((prevIndex) =>
            Math.min(prevIndex + 1, avatarList.length - 1)
        );
    };

    // Handle avatar click to trigger file input
    const handleAvatarClick = () => {
        document.getElementById("avatar-upload-input").click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                setAvatar(URL.createObjectURL(file));
                setAvatarFile(file);
                setSelectedAvatarId(null);
                setAvatarError("");
            } else {
                setAvatarError("The file must be an image.");
            }
        }
    };

    const handleAvatarSelect = (avatarUrl, avatarId) => {
        setAvatar(avatarUrl);
        setSelectedAvatarId(avatarId);
        setAvatarFile(null); // Reset uploaded file when selecting an avatar
    };

    useEffect(() => {
        return () => {
            if (avatar.startsWith("blob:")) {
                URL.revokeObjectURL(avatar); // Clean up URL.createObjectURL()
            }
        };
    }, [avatar]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const auth_token = localStorage.getItem("auth_token");
                const response = await axios.get(
                    `${apiUrl}/portal/get_all_profile_role`,
                    {
                        headers: {
                            Authorization: `Bearer ${auth_token}`,
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );
                setRoles(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching role:", error);
                setLoading(false);
            }
        };

        fetchRoles();
    }, [apiUrl]);

    return (
        <>
            <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button"
                }}
            >
                <MenuItem
                    onClick={handleViewProfile}
                    sx={{
                        color: "#3f51b5",
                        "&:hover": { backgroundColor: "#e8eaf6" },
                        borderRadius: 8
                    }}
                >
                    <IconButton>
                        <PersonIcon sx={{ color: "#3f51b5" }} />
                    </IconButton>
                    View Profile
                </MenuItem>
                <MenuItem
                    onClick={handleChangePassword}
                    sx={{
                        color: "#F8B311",
                        "&:hover": { backgroundColor: "#F2FB9A" },
                        borderRadius: 8
                    }}
                >
                    <IconButton>
                        <LockIcon sx={{ color: "#F8B311" }} />
                    </IconButton>
                    Change Password
                </MenuItem>
                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        color: "#f44336",
                        "&:hover": { backgroundColor: "#ffcdd2" },
                        borderRadius: 8
                    }}
                >
                    <IconButton>
                        <LogoutIcon sx={{ color: "#f44336" }} />
                    </IconButton>
                    Logout
                </MenuItem>
            </Menu>

            {/* View Profile Dialog */}
            <Dialog
                open={viewProfileOpen}
                onClose={handleCloseViewProfileDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>View Profile</DialogTitle>
                <DialogContent>
                    {loading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: 1
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : profileData ? (
                        <div style={{ textAlign: "center" }}>
                            <Avatar
                                alt={profileData.name}
                                src={avatar}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    margin: "0 auto",
                                    mb: 1,
                                    cursor: "pointer"
                                }}
                                onClick={handleAvatarClick} // Trigger file input on click
                            />
                            {/* Hidden file input to allow image upload */}
                            <input
                                id="avatar-upload-input"
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            />

                            {/* Avatar upload error message */}
                            {avatarError && (
                                <Box sx={{ color: "red", textAlign: "center", mt: 1 }}>
                                    {avatarError}
                                </Box>
                            )}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    mb: 1
                                }}
                            >
                                <Chip
                                    label="Click To Upload Picture OR Choose Avatar"
                                    size="medium"
                                    sx={{ margin: "0 5px" }}
                                />
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    mb: 1
                                }}
                            >
                                <Button
                                    onClick={scrollLeft}
                                    sx={{ marginRight: 1, borderRadius: "50%", width: 40, height: 60, padding: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <ArrowBackRoundedIcon />
                                </Button>

                                {avatarList
                                    .slice(scrollIndex, scrollIndex + 3)
                                    .map((avatar, index) => (
                                        <img
                                            key={index}
                                            src={avatar.path}
                                            alt="Avatar"
                                            style={{
                                                borderRadius: "50%",
                                                width: 60,
                                                height: 60,
                                                objectFit: "cover",
                                                border: "1px solid grey",
                                                marginRight: 8,
                                                cursor: "pointer"
                                            }}
                                            onClick={() => handleAvatarSelect(avatar.path, avatar.id)}
                                        />
                                    ))}

                                <Button
                                    onClick={scrollRight}
                                    sx={{ marginRight: 1, borderRadius: "50%", width: 40, height: 60, padding: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <ArrowBackRoundedIcon sx={{ transform: "rotate(180deg)" }} />
                                </Button>
                            </Box>

                            <TextField
                                margin="dense"
                                label="Email"
                                type="email"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={!!emailError}
                                helperText={emailError}
                                variant="outlined"
                                sx={{ mb: 1 }}
                            />

                            {/* Use Grid to display Name and Role in one line */}
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        margin="dense"
                                        label="Name"
                                        type="text"
                                        fullWidth
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        error={!!nameError}
                                        helperText={nameError}
                                        variant="outlined"
                                    />
                                </Grid>

                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={roles}
                                        getOptionLabel={(option) => option.name} // Display role name
                                        getOptionSelected={(option, value) =>
                                            option.id === value.id
                                        } // Manage selected option
                                        loading={loading}
                                        value={roles.find((role) => role.id === roleName) || null} // Set the selected role based on role ID
                                        onChange={(event, newValue) => {
                                            setRoleName(newValue ? newValue.id : "");
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                margin="dense"
                                                label="Role"
                                                variant="outlined"
                                                fullWidth
                                                error={Boolean(roleNameError)}
                                                helperText={roleNameError}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </div>
                    ) : (
                        <p>No profile data available.</p>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={handleCloseViewProfileDialog}
                        variant="contained"
                        color="error"
                        sx={{ color: "white" }}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={handleProfileUpdate}
                        variant="contained"
                        color="success"
                        sx={{ color: "white" }}
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Change Password Dialog */}
            <Dialog
                open={changePasswordOpen}
                onClose={handleCloseChangePasswordDialog}
            >
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        name="old_password"
                        label="Old Password"
                        type={showPassword.old_password ? "text" : "password"}
                        fullWidth
                        value={passwordFormData.old_password}
                        onChange={handlePasswordFormChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => handleToggleShowPassword("old_password")}
                                        edge="end"
                                    >
                                        {showPassword.old_password ? (
                                            <VisibilityOff />
                                        ) : (
                                            <Visibility />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        error={!!oldPasswordError}
                        helperText={oldPasswordError}
                    />
                    <TextField
                        margin="dense"
                        name="password"
                        label="New Password"
                        type={showPassword.password ? "text" : "password"}
                        fullWidth
                        value={passwordFormData.password}
                        onChange={handlePasswordFormChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => handleToggleShowPassword("password")}
                                        edge="end"
                                    >
                                        {showPassword.password ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        error={!!passwordError}
                        helperText={passwordError}
                    />
                    <TextField
                        margin="dense"
                        name="password_confirmation"
                        label="Confirm Password"
                        type={showPassword.password_confirmation ? "text" : "password"}
                        fullWidth
                        value={passwordFormData.password_confirmation}
                        onChange={handlePasswordFormChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            handleToggleShowPassword("password_confirmation")
                                        }
                                        edge="end"
                                    >
                                        {showPassword.password_confirmation ? (
                                            <VisibilityOff />
                                        ) : (
                                            <Visibility />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseChangePasswordDialog}
                        variant="contained"
                        color="error"
                        sx={{ color: "white" }}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={handlePasswordFormSubmit}
                        variant="contained"
                        color="success"
                        sx={{ color: "white" }}
                    >
                        Change
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default MenuSection;
