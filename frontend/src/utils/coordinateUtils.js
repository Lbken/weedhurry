export const processCoordinates = (coordinates) => {
  if (!coordinates || !Array.isArray(coordinates)) {
    console.warn('Invalid coordinates format:', coordinates);
    return null;
  }

  return coordinates.map(coord => {
    if (typeof coord === 'object') {
      // Handle MongoDB extended JSON format
      if (coord.$numberDouble !== undefined) {
        return parseFloat(coord.$numberDouble);
      }
      if (coord.$numberInt !== undefined) {
        return parseFloat(coord.$numberInt);
      }
    }
    return parseFloat(coord);
  });
};

export const enrichVendor = (vendor, userLat, userLng) => {
  let coordinates = null;
  let source = null;

  // Check vendor type first and use appropriate coordinates
  if (vendor.dispensaryType === 'Delivery') {
    // For delivery-only vendors, use delivery zone coordinates
    if (vendor.deliveryZone?.coordinates) {
      coordinates = processCoordinates(vendor.deliveryZone.coordinates);
      source = 'delivery';
    }
  } else if (vendor.dispensaryType === 'Pickup') {
    // For pickup-only vendors, use storefront coordinates
    if (vendor.storefrontAddress?.coordinates) {
      coordinates = processCoordinates(vendor.storefrontAddress.coordinates);
      source = 'storefront';
    }
  } else if (vendor.dispensaryType === 'Pickup & Delivery') {
    // For pickup & delivery vendors, prefer storefront but fall back to delivery zone
    if (vendor.storefrontAddress?.coordinates) {
      coordinates = processCoordinates(vendor.storefrontAddress.coordinates);
      source = 'storefront';
    } else if (vendor.deliveryZone?.coordinates) {
      coordinates = processCoordinates(vendor.deliveryZone.coordinates);
      source = 'delivery';
    }
  }

  if (!coordinates || coordinates.length !== 2) {
    console.warn(`Invalid coordinates for vendor ${vendor.dispensaryName}`, {
      type: vendor.dispensaryType,
      coordinates,
      source
    });
    return null;
  }

  const [vLng, vLat] = coordinates;

  // Calculate distance
  const R = 3963; // Earth's radius in miles
  const dLat = (vLat - userLat) * Math.PI / 180;
  const dLng = (vLng - userLng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(userLat * Math.PI / 180) * Math.cos(vLat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return {
    ...vendor,
    coordinates: [vLng, vLat],
    coordinateSource: source,
    milesAway: parseFloat(distance.toFixed(1))
  };
};