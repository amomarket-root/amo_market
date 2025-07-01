import React, { useState, useCallback, useEffect } from 'react';
import {
    Box, Button, Container, Grid, Typography, Paper, FormControl, FormLabel,
    FormControlLabel, RadioGroup, Radio, IconButton, LinearProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShieldIcon from '@mui/icons-material/Shield';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PrintIcon from '@mui/icons-material/Print';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TuneIcon from '@mui/icons-material/Tune';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { PDFDocument } from 'pdf-lib';
import axios from 'axios';
import { useSweetAlert } from '../Theme/SweetAlert';
import { useSnackbar } from '../Theme/SnackbarAlert';
import CartButton from '../Cart/CartButton';
import LoginModal from '../Auth/LoginModal';

const PrintStore = ({ shopId, shopName, shopType }) => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [colorOption, setColorOption] = useState('Black & White');
    const [paperSize, setPaperSize] = useState('A4');
    const [printSide, setPrintSide] = useState('One Side');
    const [orientation, setOrientation] = useState('Portrait');
    const [totalPages, setTotalPages] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [copies, setCopies] = useState(1);
    const [isUploaded, setIsUploaded] = useState(false);
    const fileInputRef = React.createRef();
    const apiUrl = import.meta.env.VITE_API_URL;
    const portal_token = localStorage.getItem('portal_token');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [cartVisible, setCartVisible] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const showAlert = useSweetAlert();
    const showSnackbar = useSnackbar();

    const getPageCount = async (file) => {
        if (file.type === 'application/pdf') {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                return pdfDoc.getPageCount();
            } catch (error) {
                console.error('Error reading PDF:', error);
                return 1; // Default to 1 page if there's an error
            }
        }
        return 1; // For non-PDF files (images), count as 1 page
    };

    const calculateTotal = useCallback(async () => {
        if (files.length === 0) {
            setTotalPages(0);
            setTotalAmount(0);
            return;
        }

        let pageCount = 0;
        for (const file of files) {
            const pages = await getPageCount(file);
            pageCount += pages;
        }

        setTotalPages(pageCount);
        const rate = colorOption === 'Black & White' ? 3 : 10;
        setTotalAmount(pageCount * rate * copies);
    }, [files, colorOption, copies]);

    useEffect(() => {
        calculateTotal();
    }, [files.length, colorOption, calculateTotal, copies]);

    const handleFileChange = useCallback(async (event) => {
        if (!portal_token) {
            setLoginModalOpen(true);
            event.target.value = ''; // Clear the file input
            return;
        }
        const newFiles = Array.from(event.target.files);
        await validateAndSetFiles(newFiles);
    }, [portal_token]);

    const handleDrop = useCallback(async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!portal_token) {
            setLoginModalOpen(true);
            return;
        }
        const newFiles = Array.from(event.dataTransfer.files);
        await validateAndSetFiles(newFiles);
    }, [portal_token]);

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const validateAndSetFiles = async (newFiles) => {
        setError('');

        // Check total files count
        const totalFiles = files.length + newFiles.length;
        if (totalFiles > 15) {
            setError('Maximum 15 files allowed');
            return;
        }

        // Check individual file sizes and total size
        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
        let totalSize = files.reduce((sum, file) => sum + file.size, 0);

        for (const file of newFiles) {
            if (file.size > maxSize) {
                setError(`File ${file.name} exceeds 50MB limit`);
                return;
            }
            totalSize += file.size;
            if (totalSize > maxSize) {
                setError('Total files size exceeds 50MB limit');
                return;
            }
        }

        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        setIsUploaded(updatedFiles.length > 0);
    };

    const removeFile = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        setIsUploaded(updatedFiles.length > 0);
    };

    const handleUploadClick = () => {
        if (!portal_token) {
            setLoginModalOpen(true);
            return;
        }
        fileInputRef.current.click();
    };

    const handleColorChange = (event) => {
        setColorOption(event.target.value);
    };

    const handlePaperSizeChange = (event) => {
        setPaperSize(event.target.value);
    };

    const handlePrintSideChange = (event) => {
        setPrintSide(event.target.value);
    };

    const handleOrientationChange = (event) => {
        setOrientation(event.target.value);
    };

    const handleIncreaseCopies = () => {
        setCopies(prev => prev + 1);
    };

    const handleDecreaseCopies = () => {
        if (copies > 1) {
            setCopies(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (files.length === 0) {
            setError('Please select at least one file to upload');
            return;
        }
        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Create FormData for file upload
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files[]', file);
            });

            // Prepare service data object
            const serviceData = {
                shop_id: shopId,
                shop_name: shopName,
                shop_type: shopType,
                color_option: colorOption,
                paper_size: paperSize,
                print_side: printSide,
                orientation: orientation,
                total_pages: totalPages,
                copies: copies,
                total_amount: totalAmount
            };

            // Add service data as JSON string
            formData.append('service_data', JSON.stringify(serviceData));

            // Upload files and create service
            const response = await axios.post(`${apiUrl}/portal/cart/add`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${portal_token}`
                },
                onUploadProgress: progressEvent => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(progress);
                }
            });

            if (response.data.status) {
                // Show success in snackbar (original behavior)
                showSnackbar(response.data.message, { severity: 'success' }, 2000);

                // Reset form after successful submission
                setFiles([]);
                setIsUploaded(false);
                setTotalPages(0);
                setTotalAmount(0);
                setCopies(1);
                window.dispatchEvent(new Event('cartChange'));
                setCartVisible(true);
            } else {
                showAlert({
                    title: "Error!",
                    icon: "error",
                    text: response.data.message,
                    showConfirmButton: true,
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add to cart';
            showAlert({
                title: "Warning!",
                icon: "warning",
                text: errorMessage,
                showConfirmButton: true,
                confirmButtonText: "OK",
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <Container sx={{ maxWidth: '100%', padding: '0px', mt: 0 }} maxWidth={false}>
            {cartVisible && <CartButton />}
            <Box sx={{ padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', ml: -3 }}>
                <IconButton onClick={() => window.history.back()}>
                    <ArrowBackIcon fontSize="large" color="#9F63FF" />
                </IconButton>
                <Typography variant="h5" sx={{ color: "#646363" }} fontWeight="bold">
                    Back
                </Typography>
            </Box>
            <Typography
                variant="h4"
                gutterBottom
                align="center"
                sx={{ fontWeight: 'bold', mb: '30px' }}
            >
                {shopName}
            </Typography>

            <Grid container spacing={2} alignItems="center" justifyContent="center">
                <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
                    <Box display="flex" justifyContent="center" alignItems="center" width="100%">
                        <img
                            src="/image/print_illustration.png"
                            alt="Print Illustration"
                            style={{ maxWidth: '100%', height: 'auto' }}
                            loading="eager"
                            decoding="async"
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <Paper
                        elevation={5}
                        sx={{ p: 3, borderRadius: 2, backgroundColor: '#f4f4fb', mb: 2 }}
                    >
                        <Box display="flex" flexDirection="column" alignItems="start">
                            <Box display="flex" alignItems="center" mb={2}>
                                <CloudUploadIcon sx={{ fontSize: 40, color: '#6c63ff', mr: 2 }} />
                                <Typography variant="h5" fontWeight="bold">
                                    Upload your files
                                </Typography>
                            </Box>
                            <Typography variant="body1" color="textSecondary" mb={2}>
                                We support all popular formats like PDF, JPG, PNG, JPEG etc
                            </Typography>

                            {/* Hidden file input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png"
                            />

                            {/* Drop area */}
                            <Box
                                onClick={handleUploadClick}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                sx={{
                                    border: '2px dashed #ccc',
                                    borderRadius: 2,
                                    height: 150,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    width: '95%',
                                    maxWidth: '95%',
                                    justifyContent: files.length > 0 ? 'flex-start' : 'center',
                                    mb: 2,
                                    cursor: 'pointer',
                                    overflowY: 'auto',
                                    p: files.length > 0 ? 2 : 0,
                                    '&:hover': {
                                        borderColor: '#6c63ff',
                                        backgroundColor: 'rgba(108, 99, 255, 0.05)'
                                    }
                                }}
                            >
                                {files.length === 0 ? (
                                    <Typography color="textSecondary">Drop files here or click to upload</Typography>
                                ) : (
                                    <>
                                        {files.map((file, index) => (
                                            <Paper
                                                key={index}
                                                elevation={1}
                                                sx={{
                                                    p: 1,
                                                    mb: 1,
                                                    width: '100%',
                                                    maxWidth: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <Box display="flex" alignItems="center" sx={{ overflow: 'hidden' }}>
                                                    <InsertDriveFileIcon sx={{ mr: 1, color: '#6c63ff', flexShrink: 0 }} />
                                                    <Typography variant="body2" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                                                    </Typography>
                                                </Box>
                                                <CloseIcon
                                                    sx={{ cursor: 'pointer', color: 'error.main', flexShrink: 0 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFile(index);
                                                    }}
                                                />
                                            </Paper>
                                        ))}
                                    </>
                                )}
                            </Box>

                            {error && (
                                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                                    {error}
                                </Typography>
                            )}

                            {/* OPTIONS */}
                            <Grid container spacing={1} sx={{ mb: 2 }}>
                                {/* Color Options */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>Color</FormLabel>
                                        <RadioGroup row value={colorOption} onChange={handleColorChange}>
                                            <FormControlLabel value="Black & White" control={<Radio />} label="Black & White (₹3/page)" />
                                            <FormControlLabel value="Colour" control={<Radio />} label="Colour (₹10/page)" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>

                                {/* Paper Size */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>Paper Size</FormLabel>
                                        <RadioGroup row value={paperSize} onChange={handlePaperSizeChange}>
                                            <FormControlLabel value="A4" control={<Radio />} label="A4" />
                                            <FormControlLabel value="A3" control={<Radio />} label="A3" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>

                                {/* Side Option */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>Print Side</FormLabel>
                                        <RadioGroup row value={printSide} onChange={handlePrintSideChange}>
                                            <FormControlLabel value="One Side" control={<Radio />} label="One Side" />
                                            <FormControlLabel value="Both Side" control={<Radio />} label="Both Side" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>

                                {/* Orientation */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>Orientation</FormLabel>
                                        <RadioGroup row value={orientation} onChange={handleOrientationChange}>
                                            <FormControlLabel value="Portrait" control={<Radio />} label="Portrait" />
                                            <FormControlLabel value="Landscape" control={<Radio />} label="Landscape" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            {/* Summary and Copies */}
                            {files.length > 0 && (
                                <Box sx={{
                                    width: '100%',
                                    mb: 2,
                                    p: 1,
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: 1,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Box>
                                        <Typography variant="body1" fontWeight="bold">
                                            Total Pages: {totalPages}
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            Total Amount: ₹{totalAmount}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" fontWeight="bold" sx={{ mr: 1 }}>
                                            Copies:
                                        </Typography>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            background: '#10d915',
                                            borderRadius: '4px',
                                            padding: '2px 4px',
                                            color: 'white'
                                        }}>
                                            <IconButton
                                                size="small"
                                                onClick={handleDecreaseCopies}
                                                sx={{ color: 'white', padding: '4px' }}
                                            >
                                                <RemoveIcon />
                                            </IconButton>
                                            <Typography variant="body2" component="div" sx={{ margin: '0 8px', color: 'white' }}>
                                                {copies}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={handleIncreaseCopies}
                                                sx={{ color: 'white', padding: '4px' }}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Box>
                            )}

                            {isUploading && (
                                <Box sx={{ width: '100%', mb: 2 }}>
                                    <LinearProgress variant="determinate" value={uploadProgress} />
                                    <Typography variant="body2" align="center">
                                        Uploading: {uploadProgress}%
                                    </Typography>
                                </Box>
                            )}

                            <Button
                                variant="contained"
                                color={isUploaded ? "primary" : "success"}
                                sx={{ width: '100%', py: 1.5, color: 'white' }}
                                onClick={handleSubmit}
                                startIcon={isUploaded ? <ShoppingCartIcon /> : <CloudUploadIcon />}
                                disabled={isUploading || files.length === 0}
                            >
                                {isUploaded ? "Add to Cart" : "Upload your files"}
                            </Button>

                            <Typography variant="body2" mt={1} color="textSecondary">
                                Maximum upload file size: 50 MB • Maximum files: 15
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Why try print store? Section */}
            <Box
                sx={{
                    backgroundColor: '#eceffd',
                    py: 6,
                    px: 2,
                    mt: 4,
                    borderRadius: 2,
                }}
            >
                <Typography
                    variant="h5"
                    align="center"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ mb: 4 }}
                >
                    Why choose our print shop?
                </Typography>

                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                textAlign: 'center',
                                backgroundColor: 'white',
                            }}
                        >
                            <AccessTimeIcon sx={{ fontSize: 40, color: '#6c63ff', mb: 1 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Delivery in minutes
                            </Typography>
                            <Typography variant="body2">
                                Instant deliveries under 20 minutes
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                textAlign: 'center',
                                backgroundColor: 'white',
                            }}
                        >
                            <ShieldIcon sx={{ fontSize: 40, color: '#6c63ff', mb: 1 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Safe and secure
                            </Typography>
                            <Typography variant="body2">
                                We delete your files once delivered
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                textAlign: 'center',
                                backgroundColor: 'white',
                            }}
                        >
                            <ArrowDownwardIcon sx={{ fontSize: 40, color: '#6c63ff', mb: 1 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Affordable Printing
                            </Typography>
                            <Typography variant="body2">
                                B&W: ₹3 per page <br />
                                Colour: ₹10 per page
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                textAlign: 'center',
                                backgroundColor: 'white',
                            }}
                        >
                            <AccountBalanceWalletIcon sx={{ fontSize: 40, color: '#6c63ff', mb: 1 }} />
                            <Typography variant="h6" fontWeight="bold">
                                No minimum order
                            </Typography>
                            <Typography variant="body2">
                                Order as many pages as few as you want
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* How Print Store Works Section */}
            <Box
                sx={{
                    py: 6,
                    px: 2,
                    mt: 6,
                    backgroundColor: '#f0f2fc',
                    borderRadius: 2,
                }}
            >
                <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
                    How Print Store works
                </Typography>
                <Typography variant="subtitle1" align="center" mb={4}>
                    Let Near Print Shop take care of your everyday printing needs
                </Typography>

                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                            <PrintIcon sx={{ fontSize: 50, color: '#6c63ff', mb: 2 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Visit Print Shop
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Open AmoMarket app and visit Print Shop
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                            <UploadFileIcon sx={{ fontSize: 50, color: '#6c63ff', mb: 2 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Upload file(s)
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Upload a file or multiple files to take prints
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                            <TuneIcon sx={{ fontSize: 50, color: '#6c63ff', mb: 2 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Customise print
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Choose print settings as per your requirement
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center">
                            <ShoppingCartIcon sx={{ fontSize: 50, color: '#6c63ff', mb: 2 }} />
                            <Typography variant="h6" fontWeight="bold">
                                Checkout
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Add prints to cart and place an order
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
        </Container>
    );
};

export default PrintStore;
