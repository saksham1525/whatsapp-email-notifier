/**
 * Health check endpoint
 * Returns service status for monitoring and load balancers
 */
exports.handler = async function handler(context, event, callback) {
  return callback(null, { ok: true, service: "whatsapp-email-alerts" });
};