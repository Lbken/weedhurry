const axios = require('axios');

class ExternalApiService {
  constructor() {
    this.client = axios.create({
      baseURL: 'http://wehocourier.com/api',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WEHO_COURIER_API_KEY}`
      }
    });
  }

  async sendOrderNotification(vendorPhone, orderTotal) {
    try {
      // Log incoming parameters
      console.log('ExternalApiService - Function parameters:', {
        vendorPhone,
        orderTotal,
        phoneType: typeof vendorPhone
      });

      // Validate phone number
      if (!vendorPhone || typeof vendorPhone !== 'string') {
        console.error('ExternalApiService - Invalid phone number:', {
          received: vendorPhone,
          type: typeof vendorPhone
        });
        throw new Error('Vendor phone number is required and must be a string');
      }

      const payload = {
        to: vendorPhone,
        message: `You have a new order for $${orderTotal.toFixed(2)}! \u{1F44F} Check your WH account for details.`
      };

      console.log('ExternalApiService - Sending request:', {
        url: `${this.client.defaults.baseURL}/send-text`,
        payload,
        hasAuthToken: !!this.client.defaults.headers.Authorization
      });

      const response = await this.client.post('/send-text', payload);

      console.log('ExternalApiService - Response received:', {
        status: response.status,
        data: response.data
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('ExternalApiService - Error occurred:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          headers: {
            ...error.config.headers,
            Authorization: error.config.headers.Authorization ? 'present' : 'missing'
          }
        } : null
      });

      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ExternalApiService();