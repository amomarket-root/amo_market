import React, { useEffect, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SweetAlertProvider } from './components/Theme/SweetAlert';
import { SnackbarProvider } from './components/Theme/SnackbarAlert';
import ReactGA from 'react-ga4';
import './bootstrap';
import '../css/app.css'; // Import the app.css file

// Create QueryClient instance
const queryClient = new QueryClient();

// Import LocationProvider
import { LocationProvider } from './components/Location/LocationContext';

// Lazy load only the PortalRoutes component
const PortalRoutes = lazy(() => import('./components/Route/PortalRoutes'));
const AuthCallback = lazy(() => import('./components/Auth/AuthCallback'));

// Path to the loader image from the public folder
const loaderGif = '/image/loader.gif'; // Assuming the loader.gif is in public/images folder

const App = () => {
    // Initialize Google Analytics
    useEffect(() => {
        ReactGA.initialize('G-SE5TYB3Z80');
    }, []);

    return (
        <QueryClientProvider client={queryClient}> {/* Wrap entire app */}
            <SweetAlertProvider>
                <SnackbarProvider>
                    <Suspense fallback={
                        <div className="loader-container">
                            <img src={loaderGif} alt="Loading..." className="loader" />
                        </div>
                    }>
                        <Routes>
                            <Route path="/*" element={<LocationProvider><PortalRoutes /></LocationProvider>} />
                            <Route path="/auth/callback" element={<LocationProvider><AuthCallback /></LocationProvider>} />
                        </Routes>
                    </Suspense>
                </SnackbarProvider>
            </SweetAlertProvider>
        </QueryClientProvider>
    );
};

export default App;

const root = createRoot(document.getElementById('app'));
root.render(
    <Router>
        <App />
    </Router>
);
