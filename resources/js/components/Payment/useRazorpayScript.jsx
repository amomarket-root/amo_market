import { useEffect, useState } from "react";

const useRazorpayScript = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if already loaded
    if (window.Razorpay) {
      setScriptLoaded(true);
      return;
    }

    // Check if already loading
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (!window.Razorpay) {
        setError(new Error("Razorpay object not available after script load"));
        return;
      }
      setScriptLoaded(true);
    };

    script.onerror = () => {
      setError(new Error("Failed to load Razorpay script"));
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup only if we added it
      if (script.parentNode === document.body) {
        document.body.removeChild(script);
      }
    };
  }, []);

  if (error) {
    console.error("Razorpay script loading error:", error);
  }

  return scriptLoaded;
};

export default useRazorpayScript;
