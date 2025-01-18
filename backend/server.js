const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Unified CORS configuration
const corsOptions = {
    origin: function(origin, callback) {
        const allowedOrigins = [
            'https://weedhurry.com',
            'https://www.weedhurry.com',
            'http://localhost:3000'
        ];
        // Log the origin for debugging
        console.log('Request origin:', origin);
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Origin not allowed:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Origin'],
    exposedHeaders: ['Set-Cookie']
};

// Basic middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Cookie handling middleware
app.use((req, res, next) => {
    const originalSetHeader = res.setHeader;
    res.setHeader = function(name, value) {
        if (name === 'Set-Cookie') {
            const cookies = Array.isArray(value) ? value : [value];
            const processedCookies = cookies.map(cookie => {
                if (cookie && !cookie.includes('SameSite')) {
                    return `${cookie}; SameSite=None; Secure`;
                }
                return cookie;
            });
            originalSetHeader.call(this, name, processedCookies);
        } else {
            originalSetHeader.call(this, name, value);
        }
    };
    next();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('MongoDB connected');
    
    try {
        const Vendor = require('./models/Vendor');
        
        // Log existing indexes
        const indexes = await Vendor.collection.getIndexes();
        console.log('Current indexes:', indexes);
        
        // Drop existing geospatial indexes if they exist
        try {
            await Vendor.collection.dropIndex('storefrontAddress.coordinates_2dsphere');
            await Vendor.collection.dropIndex('deliveryZone.coordinates_2dsphere');
            console.log('Dropped existing indexes');
        } catch (err) {
            console.log('No existing indexes to drop');
        }
        
        // Create new indexes
        await Promise.all([
            Vendor.collection.createIndex(
                { 'storefrontAddress.coordinates': '2dsphere' },
                { background: true }
            ),
            Vendor.collection.createIndex(
                { 'deliveryZone.coordinates': '2dsphere' },
                { background: true }
            )
        ]);
        
        console.log('Geospatial indexes created successfully');
        
        // Verify a sample vendor
        const sampleVendor = await Vendor.findOne({
            $or: [
                { 'storefrontAddress.coordinates': { $exists: true } },
                { 'deliveryZone.coordinates': { $exists: true } }
            ]
        });
        
        if (sampleVendor) {
            console.log('Sample vendor coordinates:', {
                storefront: sampleVendor.storefrontAddress?.coordinates,
                deliveryZone: sampleVendor.deliveryZone?.coordinates
            });
        } else {
            console.log('No vendors found with coordinates');
        }
        
    } catch (error) {
        console.error('Error setting up indexes:', error);
    }
})
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customerRoutes = require('./routes/customerRoutes');
const vendorProductRoutes = require('./routes/vendorProductRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const geocodeRoutes = require('./routes/geocodeRoutes');
const mapVendorRoutes = require('./routes/mapVendorRoutes');
const strainsRoutes = require('./routes/strainsRoutes');

// Mount routes in logical order
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);  // Moved up for priority
app.use('/api/products', productRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/vendor/inventory', vendorProductRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/strains', strainsRoutes);
app.use('/api/map', mapVendorRoutes);  // Moved after vendor routes
app.use('/api', orderRoutes);

// MongoDB number transformation middleware
app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function(obj) {
        const transformMongoNumbers = (obj) => {
            if (!obj) return obj;
            
            if (Array.isArray(obj)) {
                return obj.map(transformMongoNumbers);
            }
            
            if (typeof obj === 'object' && obj !== null) {
                return Object.entries(obj).reduce((acc, [key, value]) => {
                    if (value && typeof value === 'object') {
                        if (value.$numberDouble !== undefined) {
                            acc[key] = Number(value.$numberDouble);
                        } else if (value.$numberInt !== undefined) {
                            acc[key] = Number(value.$numberInt);
                        } else if (value.coordinates) {
                            acc[key] = {
                                ...value,
                                coordinates: value.coordinates.map(coord => 
                                    typeof coord === 'object' ? 
                                        Number(coord.$numberDouble || coord.$numberInt) : 
                                        Number(coord)
                                )
                            };
                        } else {
                            acc[key] = transformMongoNumbers(value);
                        }
                    } else {
                        acc[key] = value;
                    }
                    return acc;
                }, {});
            }
            return obj;
        };

        return originalJson.call(this, transformMongoNumbers(obj));
    };
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
    });

    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        return res.status(500).json({
            success: false,
            message: 'Database error',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            details: Object.values(err.errors).map(e => e.message)
        });
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});