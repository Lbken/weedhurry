// vendorUtils.js
export const extractCoordinates = (vendor) => {
    // Try storefront first for Pickup & Pickup/Delivery vendors
    if (['Pickup', 'Pickup & Delivery'].includes(vendor.dispensaryType) && 
        vendor.storefrontAddress?.coordinates) {
      const coords = vendor.storefrontAddress.coordinates.map(coord => 
        typeof coord === 'object' ? parseFloat(coord.$numberDouble || coord.$numberInt) : parseFloat(coord)
      );
      if (isValidCoordinates(coords)) {
        return { coordinates: coords, source: 'storefront' };
      }
    }
  
    // Try delivery zone for Delivery & Pickup/Delivery vendors
    if (['Delivery', 'Pickup & Delivery'].includes(vendor.dispensaryType) && 
        vendor.deliveryZone?.coordinates) {
      const coords = vendor.deliveryZone.coordinates.map(coord =>
        typeof coord === 'object' ? parseFloat(coord.$numberDouble || coord.$numberInt) : parseFloat(coord)
      );
      if (isValidCoordinates(coords)) {
        return { coordinates: coords, source: 'delivery' };
      }
    }
  
    return null;
  };
  
  export const isValidCoordinates = (coords) => {
    return Array.isArray(coords) && 
           coords.length === 2 && 
           !coords.some(isNaN) &&
           coords[0] >= -180 && coords[0] <= 180 && 
           coords[1] >= -90 && coords[1] <= 90;
  };
  
  export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRadians = (degree) => (degree * Math.PI) / 180;
    const R = 3963; // Earth's radius in miles
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };
  
  export const enrichVendorWithDistance = (vendor, userLat, userLng) => {
    const coordInfo = extractCoordinates(vendor);
    if (!coordInfo) return null;
  
    const [vLng, vLat] = coordInfo.coordinates;
    return {
      ...vendor,
      coordinates: coordInfo.coordinates,
      coordinateSource: coordInfo.source,
      milesAway: calculateDistance(userLat, userLng, vLat, vLng)
    };
  };