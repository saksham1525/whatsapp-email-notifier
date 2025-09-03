const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const webApp = express(); // Start the webapp
const PORT = process.env.PORT || 3000;

// Webapp settings
webApp.use(bodyParser.urlencoded({ extended: true }));
webApp.use(bodyParser.json());

// Import email and WhatsApp modules
const emailService = require('./services/emailService');
const whatsappService = require('./services/whatsappService');

webApp.get('/health', (req, res) => { // Health check route
    res.json({ ok: true, service: 'whatsapp-email-notifier', version: '2.0.0' });
});

webApp.post('/whatsapp', async (req, res) => { // Route for WhatsApp webhook
    try {
        const message = req.body;
        let senderID = req.body.From;
        const messageBody = (req.body.Body || '').trim().toLowerCase();

        if (senderID && senderID.includes('whatsapp:') && senderID.includes(' ')) { // Fix phone number format
            senderID = senderID.replace('whatsapp: ', 'whatsapp:+');
        }

        console.log('WhatsApp message received from:', senderID);

        const allowedNumbers = process.env.ALLOWED_NUMBERS || ''; // Authorization check
        if (allowedNumbers && !allowedNumbers.includes(senderID)) {
            console.log('Unauthorized access attempt from:', senderID);
            return res.status(403).json({ error: 'Unauthorized' });
        }

        let response = '';

        switch (messageBody) {
            case 'help':
                response = `WhatsApp Email Notifier Commands:

Basic Commands:
• help - Show this help message
• ping - Test connection
• check - Check unread emails
• about - About this service`;
                break;

            case 'ping':
                response = 'Service is running successfully';
                break;

            case 'about':
                response = `WhatsApp Email Notifier

This service allows you to check your emails via WhatsApp using IMAP.

Powered by Node.js, Express, and Twilio`;
                break;

            case 'check':
                const unreadEmails = await emailService.fetchUnreadEmails();
                response = unreadEmails;
                break;

            default:
                response = `Welcome to WhatsApp Email Notifier!

Send "help" to see all available commands.
Send "check" to check your unread emails.`;
        }

        await whatsappService.sendMessage(response, senderID); // Send response back to WhatsApp
        res.status(200).send('OK'); // Send TwiML response for webhook
        
    } catch (error) {
        console.error('Error processing WhatsApp message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

webApp.listen(PORT, () => { // Start the server
    console.log(`WhatsApp Email Notifier is running on port ${PORT}`);
    console.log(`WhatsApp webhook: http://localhost:${PORT}/whatsapp`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
