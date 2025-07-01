import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [latitude, setLatitude] = useState(() => {
        const saved = localStorage.getItem('latitude');
        return saved !== null ? parseFloat(saved) : null;
    });

    const [longitude, setLongitude] = useState(() => {
        const saved = localStorage.getItem('longitude');
        return saved !== null ? parseFloat(saved) : null;
    });

    const [address, setAddress] = useState(() => {
        return localStorage.getItem('address') || null;
    });

    const debounceTimer = useRef(null);
    const abortControllerRef = useRef(null);

    const fetchIpInfo = useCallback(async () => {
        try {
            abortControllerRef.current = new AbortController();
            const response = await fetch('https://ipinfo.io/json', {
                signal: abortControllerRef.current.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.warn('Failed to fetch IP info, proceeding without it:', error);
            }
            return null;
        } finally {
            abortControllerRef.current = null;
        }
    }, []);

    const storeLocation = useCallback(async (lat, lng) => {
        try {
            const ipInfoPromise = fetchIpInfo();
            const ipInfoTimeout = new Promise(resolve =>
                setTimeout(() => resolve(null), 1000)
            );

            const ipInfo = await Promise.race([ipInfoPromise, ipInfoTimeout]);

            const requestBody = {
                latitude: lat,
                longitude: lng,
            };

            if (ipInfo) {
                const [ipLat, ipLng] = ipInfo.loc ? ipInfo.loc.split(',') : [null, null];

                const isDifferentLocation = !ipLat || !ipLng ||
                    (Math.abs(parseFloat(ipLat) - lat) > 0.1 ||
                     Math.abs(parseFloat(ipLng) - lng) > 0.1);

                // Always attach IP info regardless of distance
                requestBody.ip_address = ipInfo.ip;
                requestBody.city = ipInfo.city;
                requestBody.state = ipInfo.region;
            }

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/portal/location/store`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Location storage error:', error);
            }
            return null;
        }
    }, [fetchIpInfo]);

    const updateLocation = useCallback((newLatitude, newLongitude, newAddress) => {
        // Convert to numbers if they aren't already
        const numLat = typeof newLatitude === 'string' ? parseFloat(newLatitude) : newLatitude;
        const numLng = typeof newLongitude === 'string' ? parseFloat(newLongitude) : newLongitude;

        localStorage.setItem('latitude', numLat);
        localStorage.setItem('longitude', numLng);

        // Maintain same behavior as old code - only update address if provided
        if (newAddress !== undefined && newAddress !== null) {
            localStorage.setItem('address', newAddress);
            setAddress(newAddress);
        }

        setLatitude(numLat);
        setLongitude(numLng);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            storeLocation(numLat, numLng)
                .catch(error => console.error('Failed to store location:', error));
        }, 1000);
    }, [storeLocation]);

    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return (
        <LocationContext.Provider value={{ latitude, longitude, address, updateLocation }}>
            {children}
        </LocationContext.Provider>
    );
};
