// Simple JSON 200 to verify service is up
exports.handler = async function handler(context, event, callback) {
  return callback(null, { ok: true, service: "whatsapp-email-alerts" });
};