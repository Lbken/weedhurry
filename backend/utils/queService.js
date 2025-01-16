const Queue = require('bull');
const externalApiService = require('./externalApiService');

// Create a new queue
const orderQueue = new Queue('external-orders', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

// Process jobs
orderQueue.process(async (job) => {
  const { orderData } = job.data;
  const result = await externalApiService.sendOrderDetails(orderData);
  
  if (!result.success) {
    throw new Error('Failed to send order to external API');
  }
  
  return result;
});

// Add retry logic
orderQueue.on('failed', async (job, err) => {
  if (job.attemptsMade < 3) { // Retry up to 3 times
    await job.retry();
  } else {
    console.error(`Job ${job.id} failed after ${job.attemptsMade} attempts:`, err);
    // Here you could implement additional error handling like:
    // - Sending alerts
    // - Logging to error tracking service
    // - Moving to dead letter queue
  }
});

module.exports = {
  addToQueue: async (orderData) => {
    return orderQueue.add(
      { orderData },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000 // Starting delay of 1 second
        }
      }
    );
  }
};