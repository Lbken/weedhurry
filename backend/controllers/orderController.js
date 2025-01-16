const Vendor = require('../models/Vendor');
const Order = require('../models/Order');

exports.getVendorOrders = async (req, res) => {
  const { vendorId } = req.params;
  try {
    const orders = await Order.find({ vendorId })
      .select('total deliveryAddress items status createdAt contactInfo orderType customer')
      .populate('customer', 'birthdate')
      .sort({ createdAt: -1 })
      .limit(10);

    // Make sure items have all necessary fields including images
    orders.forEach(order => {
      if (order.items) {
        order.items = order.items.map(item => ({
          ...item,
          image: item.image || '/placeholder-image.png' // Provide a fallback image
        }));
      }
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ message: 'Failed to fetch vendor orders' });
  }
};




exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const vendorId = req.vendorId; // From authMiddleware

  try {
    // Verify the order exists and belongs to this vendor
    const order = await Order.findOne({
      _id: orderId,
      vendorId: vendorId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized'
      });
    }

    // Validate status is one of the allowed enum values
    if (!['AWAITING_PROCESSING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Update the order status
    order.status = status;
    await order.save();

    // Return the updated order
    const updatedOrder = await Order.findById(orderId)
      .select('total deliveryAddress items status createdAt contactInfo orderType customer')
      .populate('customer', 'birthdate');

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

exports.sendVendorNotification = async (req, res) => {
  const { orderId } = req.params;
  const { message } = req.body;

  try {
    // Find the order by ID and populate the vendor
    const order = await Order.findById(orderId).populate('vendorId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Fetch the vendor's phone number
    const vendor = order.vendorId;
    if (!vendor || !vendor.phone) {
      return res.status(404).json({ message: 'Vendor not found or phone number missing' });
    }

    // Simulate sending a notification to the vendor
    console.log(`Sending notification to vendor: ${vendor.phone}`);
    console.log(`Message: ${message}`);

    // Optionally, save the notification in MongoDB
    order.vendorNotifications = order.vendorNotifications || [];
    order.vendorNotifications.push(message);
    await order.save();

    res.status(200).json({ message: 'Notification sent successfully to vendor', order });
  } catch (error) {
    console.error('Error in sendVendorNotification:', error);
    res.status(500).json({ message: 'Failed to send notification to vendor', error: error.message });
  }
};

