import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const portalToken = searchParams.get('portal_token');
        const user = searchParams.get('user');

        if (portalToken && user) {
            try {
                // Clear existing tokens if any
                if (localStorage.getItem('portal_token')) {
                    localStorage.removeItem('portal_token');
                    localStorage.removeItem('user_id');
                }

                // Parse user data to get the user_id
                const userData = JSON.parse(user);
                const userId = userData.id;

                // Store only the required values with 2-second delay
                setTimeout(() => {
                    localStorage.setItem('portal_token', portalToken);
                    localStorage.setItem('user_id', userId);
                    navigate('/');
                }, 2000);

            } catch (error) {
                console.error('Auth error:', error);
                navigate('/?error=auth_failed');
            }
        } else {
            navigate('/?error=missing_auth_data');
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Completing login...</h2>
                <p>You'll be redirected shortly</p>
            </div>
        </div>
    );
};

export default AuthCallback;
