const Vendor = require('../models/Vendor');
const VendorProduct = require('../models/VendorProduct');
const getMapVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find({
            status: 'active',
            dispensaryType: { $in: ['Pickup', 'Pickup & Delivery', 'Delivery'] }
        })
        .select('dispensaryName dispensaryType storefrontAddress logoUrl businessHours minOrder acceptedPayments dailyPromo')
        .lean();
        if (!vendors || vendors.length === 0) {
            return res.status(200).json({
                success: true,
                vendors: []
            });
        }
        // Process vendors to ensure proper ID and coordinate handling
        const processedVendors = vendors.map(vendor => {
            const processed = { ...vendor };
            
            // Ensure _id is properly converted to string
            processed._id = vendor._id.toString();
            
            // Process coordinates if they exist
            if (vendor.storefrontAddress?.coordinates) {
                processed.storefrontAddress = {
                    ...vendor.storefrontAddress,
                    coordinates: vendor.storefrontAddress.coordinates.map(coord => {
                        // Handle both plain numbers and MongoDB Extended JSON format
                        if (typeof coord === 'object') {
                            return parseFloat(coord.$numberDouble || coord.$numberInt || coord);
                        }
                        return parseFloat(coord);
                    })
                };
            }
            
            return processed;
        }).filter(vendor => 
            vendor.storefrontAddress?.coordinates?.length === 2 &&
            !vendor.storefrontAddress.coordinates.some(isNaN)
        );
        // Get products for vendors
        const vendorIds = processedVendors.map(vendor => vendor._id);
        const allVendorProducts = await VendorProduct.find({
            vendorId: { $in: vendorIds },
            status: 'Active'
        })
        .select('vendorId name brand category strain variation')
        .lean();
        // Group products by vendor
        const productsByVendor = allVendorProducts.reduce((acc, product) => {
            const vendorId = product.vendorId.toString();
            if (!acc[vendorId]) {
                acc[vendorId] = [];
            }
            
            const transformedProduct = {
                _id: product._id.toString(),
                name: product.name,
                brand: product.brand,
                category: product.category,
                strain: product.variation?.strain || 'N/A',
                thcContent: product.variation?.thcContent || null,
                price: product.variation?.price || 0,
                salePrice: product.variation?.salePrice || null,
                image: product.variation?.image || '/placeholder-image.png',
                amount: product.variation?.amount || 'N/A',
                tags: product.variation?.tags || []
            };
            
            acc[vendorId].push(transformedProduct);
            return acc;
        }, {});
        // Combine vendor data with their products
        const vendorsWithProducts = processedVendors.map(vendor => ({
            _id: vendor._id,  // Already converted to string above
            dispensaryName: vendor.dispensaryName,
            dispensaryType: vendor.dispensaryType,
            storefrontAddress: vendor.storefrontAddress,
            logoUrl: vendor.logoUrl,
            businessHours: vendor.businessHours || {},
            minOrder: vendor.minOrder || 0,
            acceptedPayments: vendor.acceptedPayments || [],
            dailyPromo: vendor.dailyPromo,
            products: productsByVendor[vendor._id] || []
        }));
        res.status(200).json({
            success: true,
            vendors: vendorsWithProducts
        });
    } catch (error) {
        console.error('Error in getMapVendors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vendors'
        });
    }
};
module.exports = { getMapVendors };