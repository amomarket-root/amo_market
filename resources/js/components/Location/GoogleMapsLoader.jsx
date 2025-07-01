// GoogleMapsLoader.js
import { useEffect, useState } from 'react';

const useGoogleMaps = (apiKey) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script';
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      // If script is already loading, set up an interval to check
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
      } else {
        setLoadError(new Error('Google Maps API failed to load'));
      }
    };

    script.onerror = () => {
      setLoadError(new Error('Google Maps API failed to load'));
    };

    document.head.appendChild(script);

    return () => {
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [apiKey]);

  return { isLoaded, loadError };
};

export default useGoogleMaps;
