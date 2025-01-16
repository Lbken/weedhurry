const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { uploadLogoToS3 } = require('../utils/fileUpload');
const s3 = require('../utils/s3'); // Adjust the path based on your project structure
const VendorProduct = require('../models/VendorProduct'); // Adjust the path if necessary


const uploadVendorLogo = async (req, res) => {
    try {
        // Check if the middleware attached the required data
        const { logoUrl, logoKey } = req;
        if (!logoUrl || !logoKey) {
            return res.status(400).json({ error: 'Logo upload failed.' });
        }

        // Find the vendor
        const vendor = await Vendor.findById(req.vendorId);
        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found.' });
        }

        // Delete the old logo from S3 if it exists
        if (vendor.logoKey) {
            const deleteParams = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: vendor.logoKey, // Old logo's S3 key
            };

            try {
                await s3.deleteObject(deleteParams).promise();
                console.log(`Deleted old logo: ${vendor.logoKey}`);
            } catch (err) {
                console.error('Error deleting old logo from S3:', err.message);
            }
        }

        // Update vendor with new logo details
        vendor.logoUrl = logoUrl; // Save the URL to logoUrl
        vendor.logoKey = logoKey; // Save the S3 key to logoKey
        await vendor.save();

        res.status(200).json({ success: true, logoUrl });
    } catch (err) {
        console.error('Error uploading logo:', err.message);
        res.status(500).json({ error: 'File upload failed.' });
    }
};




const getVendorProfile = async (req, res) => {
  try {
      const vendor = await Vendor.findById(req.vendorId);
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
      
      res.status(200).json({ success: true, data: vendor });
  } catch (error) {
      console.error("Error fetching vendor profile:", error);
      res.status(500).json({ success: false, message: 'Error fetching vendor profile' });
  }
};

const updateDispensaryInfo = async (req, res) => {
  try {
      const { dispensaryName, dispensaryType, license, storefrontAddress } = req.body;

      // Basic validation
      if (!dispensaryName || !dispensaryType) {
          return res.status(400).json({
              success: false,
              message: 'Dispensary name and type are required.',
          });
      }

      // Create update object
      const updateData = {
          dispensaryName,
          dispensaryType,
      };

      // Handle license field
      if (license !== undefined) {
          updateData.license = license;
      }

      // Validate and handle storefrontAddress if provided
      if (storefrontAddress) {
          if (
              !storefrontAddress.formatted ||
              !storefrontAddress.coordinates ||
              !Array.isArray(storefrontAddress.coordinates) ||
              storefrontAddress.coordinates.length !== 2
          ) {
              return res.status(400).json({
                  success: false,
                  message: 'Invalid storefront address format. Must include formatted address and coordinates [lng, lat].',
              });
          }

          // Only include storefrontAddress for Pickup or Pickup & Delivery types
          if (['Pickup', 'Pickup & Delivery'].includes(dispensaryType)) {
              updateData.storefrontAddress = {
                  type: 'Point',
                  formatted: storefrontAddress.formatted,
                  coordinates: storefrontAddress.coordinates.map(coord => parseFloat(coord)),
              };
          }
      }

      // Update vendor with validated data
      const updatedVendor = await Vendor.findByIdAndUpdate(
          req.vendorId,
          updateData,
          { 
              new: true, 
              runValidators: true,
              // Return any validation errors
              validateBeforeSave: true 
          }
      );

      if (!updatedVendor) {
          return res.status(404).json({ 
              success: false, 
              message: 'Vendor not found' 
          });
      }

      res.status(200).json({
          success: true,
          message: 'Dispensary information updated successfully',
          data: updatedVendor,
      });

  } catch (error) {
      console.error('Error updating dispensary information:', error);
      
      // Handle validation errors specifically
      if (error.name === 'ValidationError') {
          return res.status(400).json({
              success: false,
              message: 'Validation error',
              errors: Object.values(error.errors).map(err => err.message)
          });
      }

      // Handle other types of errors
      res.status(500).json({ 
          success: false, 
          message: 'Error updating dispensary information',
          error: error.message
      });
  }
};


const updateVendorProfile = async (req, res) => {
  try {
      const {
          firstName,
          lastName,
          dispensaryName,
          businessAddress,
          businessHours,
          taxRate,
          contactNumber,
          storeLogo,
          storeNotice,
          status,
          minOrder,
          deliveryZone,
      } = req.body;

      // Check for existing contact number if it's being updated
      if (contactNumber) {
        const existingVendorWithPhone = await Vendor.findOne({
            'contactNumber.e164': contactNumber.e164,
            _id: { $ne: req.vendorId }
        });
        
        if (existingVendorWithPhone) {
            return res.status(400).json({
                success: false,
                message: 'A vendor with this contact number already exists.',
            });
        }
    }

      // Prepare the update object dynamically
      const updateData = {
          firstName,
          lastName,
          dispensaryName,
          businessAddress,
          contactNumber,
          storeLogo,
          storeNotice,
          status,
          taxRate,
          minOrder,
          businessHours,
      };

      // Ensure deliveryZone is properly formatted
      if (deliveryZone && deliveryZone.lat && deliveryZone.lng) {
          updateData.deliveryZone = {
              type: 'Point',
              coordinates: [deliveryZone.lng, deliveryZone.lat], // GeoJSON format
          };
      }

      // Update the vendor document
      const updatedVendor = await Vendor.findByIdAndUpdate(
          req.vendorId,
          updateData,
          { new: true, runValidators: true }
      );

      if (!updatedVendor) {
          return res.status(404).json({ success: false, message: 'Vendor not found' });
      }

      res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          data: updatedVendor,
      });
  } catch (error) {
      console.error('Error updating vendor profile:', error);
      res.status(500).json({ success: false, message: 'Error updating vendor profile' });
  }
};

const updateDeliveryZone = async (req, res) => {
    try {
        const { deliveryZone } = req.body;

        if (!deliveryZone || !deliveryZone.coordinates || deliveryZone.type !== 'Point') {
            return res.status(400).json({
                success: false,
                message: 'Invalid deliveryZone format. Ensure it includes type: "Point" and coordinates: [lng, lat].',
            });
        }

        // Find the vendor and update the deliveryZone
        const updatedVendor = await Vendor.findByIdAndUpdate(
            req.vendorId,
            { deliveryZone },
            { new: true, runValidators: true } // Ensure validation and return updated document
        );

        if (!updatedVendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Delivery zone updated successfully',
            data: updatedVendor.deliveryZone,
        });
    } catch (error) {
        console.error('Error updating delivery zone:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating delivery zone',
            error: error.message,
        });
    }
};



const deactivateVendorAccount = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendorId);
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found.' });
        }

        vendor.status = 'inactive';
        await vendor.save();

        res.status(200).json({ success: true, message: 'Account deactivated successfully.' });
    } catch (error) {
        console.error('Error deactivating vendor account:', error);
        res.status(500).json({ success: false, message: 'Failed to deactivate account.' });
    }
};


const getVendorById = async (req, res) => {
  const { vendorId } = req.params;
  try {
    const vendor = await Vendor.findById(vendorId)
    .select('dispensaryName dispensaryType storefrontAddress logoUrl acceptedPayments businessHours contactNumber minOrder dailyPromo');
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
      console.log("Vendor Data:", vendor);
      res.status(200).json({ success: true, data: vendor });
  } catch (error) {
      console.error("Error fetching vendor by ID:", error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateBusinessHours = async (req, res) => {
    try {
      const { businessHours } = req.body;
  
      if (!businessHours) {
        return res.status(400).json({ success: false, message: 'Business hours are required' });
      }
  
      const updatedVendor = await Vendor.findByIdAndUpdate(
        req.vendorId,
        { businessHours },
        { new: true, runValidators: true }
      );
  
      if (!updatedVendor) {
        return res.status(404).json({ success: false, message: 'Vendor not found' });
      }
  
      res.status(200).json({
        success: true,
        message: 'Business hours updated successfully',
        data: updatedVendor,
      });
    } catch (error) {
      console.error('Error updating business hours:', error);
      res.status(500).json({ success: false, message: 'Error updating business hours' });
    }
};
  
const updateStoreNotice = async (req, res) => {
    try {
      const { storeNotice } = req.body;
  
      if (!storeNotice || storeNotice.length > 150) {
        return res
          .status(400)
          .json({ success: false, message: 'Store notice must be 150 characters or fewer.' });
      }
  
      const updatedVendor = await Vendor.findByIdAndUpdate(
        req.vendorId,
        { storeNotice },
        { new: true, runValidators: true }
      );
  
      if (!updatedVendor) {
        return res.status(404).json({ success: false, message: 'Vendor not found.' });
      }
  
      res.status(200).json({
        success: true,
        message: 'Store notice updated successfully.',
        data: updatedVendor.storeNotice,
      });
    } catch (error) {
      console.error('Error updating store notice:', error);
      res.status(500).json({ success: false, message: 'Server error.' });
    }
};

const updateMinOrder = async (req, res) => {
  try {
    const { minOrder, acceptedPayments } = req.body;

    if (minOrder == null || isNaN(minOrder) || Number(minOrder) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid minimum order amount.',
      });
    }

    // Validate accepted payments
    if (acceptedPayments) {
      for (const payment of acceptedPayments) {
        if (!payment.method || (payment.method !== 'Cash' && 
            payment.method !== 'Debit' && payment.method !== 'Credit')) {
          return res.status(400).json({
            success: false,
            message: 'Invalid payment method.',
          });
        }

        if ((payment.method === 'Debit' || payment.method === 'Credit') && 
            (payment.fee == null || isNaN(payment.fee) || payment.fee < 0)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid fee amount for card payment.',
          });
        }
      }
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.vendorId,
      { 
        minOrder: Number(minOrder),
        acceptedPayments: acceptedPayments || []
      },
      { new: true, runValidators: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      data: {
        minOrder: updatedVendor.minOrder,
        acceptedPayments: updatedVendor.acceptedPayments
      },
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getNearbyVendors = async (req, res) => {
  const { lat, lng } = req.query;

  try {
      const vendors = await Vendor.find({
          status: 'active',
          dispensaryType: { $in: ['Pickup', 'Pickup & Delivery', 'Delivery'] }
      }).lean();

      const vendorData = vendors.map(vendor => {
          // Extract coordinates from the appropriate source
          let coordinates = null;
          
          if (['Pickup', 'Pickup & Delivery'].includes(vendor.dispensaryType) && 
              vendor.storefrontAddress?.coordinates) {
              const [lng, lat] = vendor.storefrontAddress.coordinates.map(coord => {
                  // Convert MongoDB number format to plain number
                  return typeof coord === 'object' ? 
                      Number(coord.$numberDouble || coord.$numberInt) : 
                      Number(coord);
              });
              
              coordinates = [lng, lat];
          }

          // Skip vendors without valid coordinates
          if (!coordinates || coordinates.some(isNaN)) {
              console.warn(`Invalid coordinates for vendor ${vendor.dispensaryName}`);
              return null;
          }

          return {
              _id: vendor._id,
              dispensaryName: vendor.dispensaryName,
              dispensaryType: vendor.dispensaryType,
              businessAddress: vendor.businessAddress,
              storefrontAddress: {
                  ...vendor.storefrontAddress,
                  coordinates: coordinates // Replace with plain numbers
              },
              logoUrl: vendor.logoUrl,
              rating: vendor.rating,
              minOrder: vendor.minOrder,
              businessHours: vendor.businessHours,
              dailyPromo: vendor.dailyPromo,
              acceptedPayments: vendor.acceptedPayments
          };
      }).filter(Boolean); // Remove null entries

      return res.status(200).json({
          success: true,
          vendors: vendorData
      });

  } catch (error) {
      console.error('Error in getNearbyVendors:', error);
      return res.status(500).json({
          success: false,
          message: 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
  }
};

const handleDailyPromo = async (req, res) => {
  try {
      const { title, description, applicableToSaleItems } = req.body;
      const { promoUrl, promoKey } = req;

      const vendor = await Vendor.findById(req.vendorId);
      if (!vendor) return res.status(404).json({ message: 'Vendor not found.' });

      // First try to delete any existing promo image
      if (vendor.dailyPromo?.promoKey) {
          console.log('Found existing promo key:', vendor.dailyPromo.promoKey);
          const deleteParams = {
              Bucket: process.env.S3_PROMO_BUCKET_NAME,
              Key: vendor.dailyPromo.promoKey
          };
          try {
              console.log('Attempting to delete from bucket:', process.env.S3_PROMO_BUCKET_NAME);
              await s3.deleteObject(deleteParams).promise();
              console.log(`Successfully deleted old promo image: ${vendor.dailyPromo.promoKey}`);
          } catch (err) {
              console.error('Error deleting old promo image from S3:', {
                  error: err.message,
                  stack: err.stack,
                  bucket: process.env.S3_PROMO_BUCKET_NAME,
                  key: vendor.dailyPromo.promoKey
              });
          }
      }

      // Update with new promo details
      vendor.dailyPromo = {
          title,
          description,
          promoUrl,
          promoKey,
          applicableToSaleItems,
      };

      await vendor.save();

      res.status(200).json({
          message: 'Daily promo saved successfully.',
          data: vendor.dailyPromo,
      });
  } catch (error) {
      console.error('Error saving daily promo:', error);
      res.status(500).json({ message: 'Error saving daily promo.' });
  }
};



module.exports = {
    uploadVendorLogo,
    getVendorProfile,
    updateVendorProfile,
    updateDeliveryZone,
    deactivateVendorAccount,
    getVendorById,
    updateBusinessHours,
    updateStoreNotice,
    updateMinOrder,
    getNearbyVendors,
    updateDispensaryInfo,
    handleDailyPromo,
};
