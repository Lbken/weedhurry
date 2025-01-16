// Create a new file: coordinateUtils.js

export const extractCoordinate = (coord) => {
    // Handle MongoDB $numberDouble format
    if (coord && typeof coord === 'object' && coord.$numberDouble !== undefined) {
      return parseFloat(coord.$numberDouble);
    }
    // Handle MongoDB $numberInt format
    if (coord && typeof coord === 'object' && coord.$numberInt !== undefined) {
      return parseFloat(coord.$numberInt);
    }
    // Handle plain number
    if (typeof coord === 'number') {
      return coord;
    }
    // Handle string
    if (typeof coord === 'string') {
      return parseFloat(coord);
    }
    return null;
  };
  
  export const validateCoordinates = (coords) => {
    if (!coords || !Array.isArray(coords)) {
      return false;
    }
  
    const [lng, lat] = coords.map(extractCoordinate);
  
    return (
      lng !== null &&
      lat !== null &&
      !isNaN(lng) &&
      !isNaN(lat) &&
      lng >= -180 &&
      lng <= 180 &&
      lat >= -90 &&
      lat <= 90
    );
  };
  
  export const processVendorCoordinates = (vendor) => {
    if (!vendor.storefrontAddress?.coordinates) {
      console.warn(`No coordinates found for vendor ${vendor.dispensaryName}`);
      return null;
    }
  
    const coords = vendor.storefrontAddress.coordinates;
    const [lng, lat] = coords.map(extractCoordinate);
  
    if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
      console.warn(`Invalid coordinates for vendor ${vendor.dispensaryName}:`, { lng, lat });
      return null;
    }
  
    return [lng, lat];
  };