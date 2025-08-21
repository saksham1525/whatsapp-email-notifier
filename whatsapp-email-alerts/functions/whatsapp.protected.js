// WhatsApp webhook for email notifications
const { MessagingResponse } = require("twilio").twiml;
const { searchEmails, getImapConfig } = require("../../serverless/src/imap.js");

/**
 * Splits long messages into chunks to comply with WhatsApp message limits
 * @param {string} text - Text to split
 * @param {number} maxLength - Maximum length per chunk
 * @returns {string[]} Array of message chunks
 */
function splitMessage(text, maxLength = 1500) {
  if (text.length <= maxLength) return [text];
  
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.slice(i, i + maxLength));
  }
  return chunks;
}

/**
 * WhatsApp webhook handler for processing email search commands
 */
exports.handler = async function(context, event, callback) {
  try {
    const body = (event.Body || "").trim().toLowerCase();
    const from = event.From;
    const env = { ...process.env, ...context };

    // Authorization check
    const allowedNumbers = env.ALLOWED_NUMBERS || "";
    if (allowedNumbers && !allowedNumbers.includes(from)) {
      const twiml = new MessagingResponse();
      twiml.message("Unauthorized.");
      return callback(null, twiml);
    }

    // Handle basic commands
    if (body === "help") {
      const twiml = new MessagingResponse();
      twiml.message("Commands:\nhelp\nping\ncheck unseen\nsearch from:email@domain.com\nlatest");
      return callback(null, twiml);
    }

    if (body === "ping") {
      const twiml = new MessagingResponse();
      twiml.message("pong");
      return callback(null, twiml);
    }

    // Parse search criteria
    const criteria = {};
    
    if (body.includes("unseen") || body.includes("check")) {
      criteria.unseen = true;
    }
    
    // Parameter extraction
    const fromMatch = body.match(/from:(\S+)/);
    if (fromMatch) criteria.from = fromMatch[1];
    
    const limitMatch = body.match(/limit:(\d+)/);
    if (limitMatch) criteria.limit = parseInt(limitMatch[1]);
    
    const sinceMatch = body.match(/since:(\d{4}-\d{2}-\d{2})/);
    if (sinceMatch) criteria.since = sinceMatch[1];

    // Set default limit
    if (!criteria.limit) criteria.limit = 5;

    // Search emails
    const emails = await searchEmails(criteria, getImapConfig(env));

    if (emails.length === 0) {
      const twiml = new MessagingResponse();
      twiml.message("No emails found.");
      return callback(null, twiml);
    }

    let response = `Found ${emails.length} emails:\n\n`;
    emails.forEach(email => {
      const date = new Date(email.date).toISOString().slice(0, 10);
      response += `${date}\nFrom: ${email.from}\nSubject: ${email.subject}\n\n`;
    });

    // Message splitting if too long
    const chunks = splitMessage(response);
    
    const twiml = new MessagingResponse();
    twiml.message(chunks[0]);

    // Send additional chunks if needed
    if (chunks.length > 1) {
      const client = context.getTwilioClient();
      for (let i = 1; i < chunks.length; i++) {
        setTimeout(async () => {
          await client.messages.create({
            from: env.TWILIO_WHATSAPP_FROM,
            to: from,
            body: chunks[i]
          });
        }, i * 1000); // Delay between chunks
      }
    }

    return callback(null, twiml);
    
  } catch (error) {
    console.error("Error:", error);
    const twiml = new MessagingResponse();
    twiml.message("Sorry, something went wrong. Try again later.");
    return callback(null, twiml);
  }
};