// SnackbarContext.jsx
import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import { useTheme, useMediaQuery } from '@mui/material';

// Create context
const SnackbarContext = React.createContext();

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

const SnackbarAlert = React.forwardRef(function SnackbarAlert(props, ref) {
  return (
    <MuiAlert
      elevation={6}
      ref={ref}
      variant="filled"
      {...props}
      sx={{
        color: 'white',
        '&.MuiAlert-filledSuccess': { backgroundColor: '#10d915' },
        '&.MuiAlert-filledError': { backgroundColor: '#f27474' },
        '&.MuiAlert-filledWarning': { backgroundColor: '#f7e119' },
        '&.MuiAlert-filledInfo': { backgroundColor: '#0f85d9' },
        '& .MuiAlert-icon, & .MuiSvgIcon-root': { color: 'white' },
      }}
    />
  );
});

export function SnackbarProvider({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success', // default severity
    autoHideDuration: 1000,
  });

  const showSnackbar = (message, options = {}) => {
    setSnackbar({
      open: true,
      message,
      severity: options.severity || 'success',
      autoHideDuration: options.autoHideDuration || 1000,
    });
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration}
        onClose={handleClose}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{
          '& .MuiSnackbar-root': {
            width: '100%'
          },
          '& .MuiPaper-root': {
            width: isMobile ? '100%' : 'auto',
            maxWidth: isMobile ? '100%' : 'calc(100% - 32px)',
            margin: isMobile ? 0 : '16px',
            borderRadius: isMobile ? 0 : '4px'
          }
        }}
      >
        <SnackbarAlert
          onClose={handleClose}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: 'inherit'
          }}
        >
          {snackbar.message}
        </SnackbarAlert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

// Custom hook for easy access
export const useSnackbar = () => React.useContext(SnackbarContext);
