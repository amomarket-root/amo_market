import { useEffect, useState } from "react";

const useCashfreeScript = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if already loaded
    if (window.Cashfree) {
      setScriptLoaded(true);
      return;
    }

    // Check if already loading
    if (document.querySelector('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (!window.Cashfree) {
        setError(new Error("Cashfree object not available after script load"));
        return;
      }
      setScriptLoaded(true);
    };

    script.onerror = () => {
      setError(new Error("Failed to load Cashfree script"));
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode === document.body) {
        document.body.removeChild(script);
      }
    };
  }, []);

  if (error) {
    console.error("Cashfree script loading error:", error);
  }

  return scriptLoaded;
};

export default useCashfreeScript;
