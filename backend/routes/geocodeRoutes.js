const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/', async (req, res) => {
    const { address } = req.query;
    if (!address) {
        return res.status(400).json({ error: 'Address is required' });
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        res.status(200).json(data);
    } catch (err) {
        console.error('Error in geocode API:', err);
        res.status(500).json({ error: 'Failed to fetch geocode data' });
    }
});

module.exports = router;
