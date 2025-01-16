const Vendor = require('../models/Vendor');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const externalApiService = require('../utils/externalApiService');

const handleCustomerAndOrder = async (req, res) => {
  const { 
    phone, 
    firstName, 
    lastName, 
    birthday, 
    email, 
    orderDetails, 
    vendorId, 
    totalAmount 
  } = req.body;

  if (!phone || !firstName || !lastName || !birthday || !orderDetails) {
    return res.status(400).json({ 
      message: 'Missing required fields', 
      requiredFields: ['phone', 'firstName', 'lastName', 'birthday', 'orderDetails'], 
      received: { phone, firstName, lastName, birthday, orderDetails } 
    });
  }

  try {
    // Step 1: Save or Update Customer in MongoDB
    let customer = await Customer.findOneAndUpdate(
      { phone },
      { firstName, lastName, birthdate: birthday, email },
      { upsert: true, new: true }
    );

    // Step 2: Save Order in MongoDB
    const orderData = {
      customer: customer._id,
      vendorId,
      status: 'AWAITING_PROCESSING',
      orderType: orderDetails.orderType,
      total: totalAmount,
      items: orderDetails.items.map(item => ({
        productId: item.productId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        salePrice: item.salePrice,
        image: item.image
      })),
      deliveryAddress: orderDetails.delivery_address,
      vendorDetails: orderDetails.vendorDetails,
      contactInfo: {
        firstName,
        lastName,
        email,
        phone
      },
      payment_method: orderDetails.payment_method
    };

    const order = await Order.create(orderData);

    // Step 3: Link Order to Customer
    if (!customer.orders) {
      customer.orders = [];
    }
    customer.orders.push(order._id);
    await customer.save();

    // Step 4: Update Recent Orders for Vendor
    if (!order.vendorId) {
      console.error('Order missing vendorId');
    } else {
      const vendor = await Vendor.findById(order.vendorId);
      if (!vendor) {
        console.error('Vendor not found');
      } else {
        try {
          // Send notification via WeHo Courier API
          console.log('Attempting to send notification with:', {
            phone: vendor.contactNumber?.e164,
            total: order.total
          });
          
          const notificationResult = await externalApiService.sendOrderNotification(
            vendor.contactNumber.e164,  // Changed from vendor.phone to vendor.contactNumber.e164
            order.total
          );
          
          if (!notificationResult.success) {
            console.error('Failed to send vendor notification:', notificationResult.error);
          }
        } catch (error) {
          console.error('Error sending vendor notification:', error);
        }
      }
    }

    // Step 5: Return Success Response
    res.status(200).json({
      message: 'Order processed successfully',
      orderId: order._id,
      order: {
        ...order.toObject(),
        items: orderDetails.items
      }
    });

  } catch (error) {
    console.error('Error in handleCustomerAndOrder:', error);
    res.status(500).json({ 
      error: 'Failed to process order',
      details: error.message 
    });
  }
};

const updateRecentOrders = async (vendorId, orderId) => {
  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const updatedRecentOrders = [orderId, ...vendor.recentOrders || []].slice(0, 5);
    vendor.recentOrders = updatedRecentOrders;
    await vendor.save();

    console.log('Recent orders updated for vendor:', vendorId);
  } catch (error) {
    console.error('Error updating recent orders:', error.message);
  }
};

module.exports = { handleCustomerAndOrder, updateRecentOrders };