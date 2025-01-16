// src/utils/googleMapsLoader.js

let loadingPromise = null;
const LIBRARIES = ['places', 'geometry']; // Add any required libraries here

export const loadGoogleMapsScript = () => {
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    try {
      // If script is already loaded, resolve immediately
      if (window.google?.maps) {
        console.log('Google Maps already loaded');
        resolve(window.google.maps);
        return;
      }

      // Create callback function
      const callbackName = 'googleMapsCallback';
      window[callbackName] = () => {
        console.log('Google Maps loaded successfully');
        resolve(window.google.maps);
        delete window[callbackName];
      };

      // Create script element
      const script = document.createElement('script');
      const libraries = LIBRARIES.join(',');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=${libraries}&callback=${callbackName}`;
      script.async = true;
      script.defer = true;

      // Setup error handler
      script.onerror = () => {
        console.error('Failed to load Google Maps SDK');
        loadingPromise = null; // Reset promise so it can be tried again
        reject(new Error('Failed to load Google Maps SDK'));
      };

      // Add script to document
      document.head.appendChild(script);
      console.log('Google Maps script added to DOM');
    } catch (error) {
      console.error('Error in Google Maps loader:', error);
      loadingPromise = null;
      reject(error);
    }
  });

  return loadingPromise;
};

// Add a helper to check if maps is loaded
export const isGoogleMapsLoaded = () => {
  return !!window.google?.maps;
};

// Add a helper to get geocoder instance
export const getGeocoder = async () => {
  const maps = await loadGoogleMapsScript();
  return new maps.Geocoder();
};

// Helper for geocoding addresses
export const geocodeAddress = async (address) => {
  try {
    const geocoder = await getGeocoder();
    const response = await new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK') {
          resolve(results);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
    
    if (response[0]) {
      const { lat, lng } = response[0].geometry.location;
      return {
        lat: lat(),
        lng: lng(),
        formatted_address: response[0].formatted_address
      };
    }
    throw new Error('No results found');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};