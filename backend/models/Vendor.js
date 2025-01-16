const mongoose = require('mongoose');

// Define a point schema for geospatial data
const pointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
    },
    coordinates: {
        type: [Number],
        required: true,
        validate: {
            validator: function(coords) {
                return Array.isArray(coords) &&
                       coords.length === 2 &&
                       typeof coords[0] === 'number' &&
                       typeof coords[1] === 'number' &&
                       coords[0] >= -180 && coords[0] <= 180 &&
                       coords[1] >= -90 && coords[1] <= 90;
            },
            message: 'Invalid coordinates. Must be [longitude, latitude] as numbers within valid ranges.'
        }
    }
});

const VendorSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dispensaryName: { type: String, required: true },
    license: { type: String },
    contactNumber: { 
        formatted: { type: String, required: true },
        e164: { type: String, required: true, unique: true }
    },
    logoUrl: { 
        type: String,
        default: 'https://weedhurry-vendor-logos.s3.us-east-2.amazonaws.com/miniLogoBlack.jpg'
    },
    logoKey: { type: String },
    storeNotice: { type: String },
    rating: { type: String },
    minOrder: { type: Number },

    dailyPromo: {
        title: { type: String },
        description: { type: String },
        promoUrl: { type: String },
        promoKey: { type: String },
        applicableToSaleItems: { type: Boolean, default: false },
    },

    acceptedPayments: [{
        method: {
            type: String,
            required: true,
        },
        fee: {
            type: Number,
            min: 0,
            default: 0,
        },
    }],

    status: { 
        type: String, 
        enum: ['active', 'inactive', 'pending', 'suspended'], 
        default: 'active' 
    },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    dispensaryType: { 
        type: String, 
        enum: ['Pickup', 'Delivery', 'Pickup & Delivery'],
        required: true 
    },

    // Updated deliveryZone using pointSchema with conditional requirement
    deliveryZone: {
        type: pointSchema,
        validate: {
            validator: function(v) {
                if (['Delivery', 'Pickup & Delivery'].includes(this.dispensaryType)) {
                    return v && v.coordinates && v.coordinates.length === 2;
                }
                return true; // Skip validation if not delivery type
            },
            message: 'Delivery zone coordinates are required for Delivery vendors'
        }
    },

    // Updated storefrontAddress with better validation
    storefrontAddress: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            set: function(coords) {
                if (Array.isArray(coords)) {
                    return coords.map(coord => parseFloat(coord));
                }
                return coords;
            }
        },
        formatted: { type: String, required: true }
    },
    
    businessHours: {
        monday: { 
            open: { type: String }, 
            close: { type: String }
        },
        tuesday: { 
            open: { type: String }, 
            close: { type: String }
        },
        wednesday: { 
            open: { type: String }, 
            close: { type: String }
        },
        thursday: { 
            open: { type: String }, 
            close: { type: String }
        },
        friday: { 
            open: { type: String }, 
            close: { type: String }
        },
        saturday: { 
            open: { type: String }, 
            close: { type: String }
        },
        sunday: { 
            open: { type: String }, 
            close: { type: String }
        }
    },

    taxRate: { type: Number, default: 0 },
    recentOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    analytics: {
        totalOrders: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        averageOrderValue: { type: Number, default: 0 },
    },
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            // Transform coordinates to plain numbers when converting to JSON
            if (ret.storefrontAddress && Array.isArray(ret.storefrontAddress.coordinates)) {
                ret.storefrontAddress.coordinates = ret.storefrontAddress.coordinates.map(coord => 
                    parseFloat(parseFloat(coord).toFixed(7))
                );
            }
            return ret;
        }
    }
});

// Pre-save middleware to ensure coordinates are numbers
VendorSchema.pre('save', function(next) {
    if (this.storefrontAddress && this.storefrontAddress.coordinates) {
        this.storefrontAddress.coordinates = this.storefrontAddress.coordinates.map(Number);
    }
    if (this.deliveryZone && this.deliveryZone.coordinates) {
        this.deliveryZone.coordinates = this.deliveryZone.coordinates.map(Number);
    }
    next();
});

// Virtual fields
VendorSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'vendorId',
    justOne: false,
});

VendorSchema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'vendorId',
    justOne: false,
});

// Indexes for geospatial queries
VendorSchema.index({ 'deliveryZone.coordinates': '2dsphere' });
VendorSchema.index({ 'storefrontAddress.coordinates': '2dsphere' });

module.exports = mongoose.model('Vendor', VendorSchema);