const axios = require('axios');

// Configuration details
const baseUrl = 'https://api.treez.io/v2.0/dispensary/partnersandbox2'; // Replace 'partnersandbox2' with your actual dispensary name
const clientId = 'wNzewkHXh2P5GnfCFPX3AmeA'; // Replace with your actual client_id
const apiKey = 'MTQ5Mjg2ODdjMDBmNTliZDUxZ'; // Replace with your actual API key
const phone = '5555551014'; // Hardcoded phone number for testing

/**
 * Function to check if a customer exists by phone
 * @returns {Object|null} - Customer details if found, null otherwise
 */
const checkCustomerByPhone = async () => { // Removed phone parameter
  try {
    // Step 1: Get Bearer Token
    const tokenResponse = await axios.post(`${baseUrl}/config/api/gettokens`, null, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      params: { client_id: clientId, apikey: apiKey },
    });

    const bearerToken = tokenResponse.data.access_token;

    // Step 2: Check if customer exists by phone
    const url = `${baseUrl}/customer/phone/${phone}`; // Use hardcoded phone variable
    const headers = {
      Authorization: `Bearer ${bearerToken}`, // Ensure 'Bearer' is included
      'Content-Type': 'application/json',
      client_id: clientId, // Match client_id header from Postman call
    };

    const customerResponse = await axios.get(url, { headers });

    // Check resultCode and data
    if (customerResponse.data.resultCode === 'SUCCESS' && customerResponse.data.data.length > 0) {
      console.log('Customer exists:', customerResponse.data.data[0]);
      return customerResponse.data.data[0]; // Return existing customer details
    } else {
      console.log('Customer does not exist.');
      return null; // No customer found
    }
  } catch (error) {
    console.error('Error in checkCustomerByPhone:', error.response?.data || error.message);
    throw new Error('Failed to check customer by phone');
  }
};

module.exports = { checkCustomerByPhone };
