/**
 * Integration tests with REAL API calls
 * Run with: npm test -- integration.real.test.js
 * WARNING: These make actual API calls - costs money!
 * Remove .skip to run these tests
 */

require('dotenv').config();
const emailService = require('../services/emailService');
const twilio = require('twilio');

describe.skip('Integration Tests (Real APIs)', () => {
    test('Environment: all required variables are set', () => {
        const required = {
            EMAIL_USER: process.env.EMAIL_USER,
            EMAIL_PASS: process.env.EMAIL_PASS,
            TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
            TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
            TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM,
            ALLOWED_NUMBERS: process.env.ALLOWED_NUMBERS
        };

        const missing = Object.entries(required)
            .filter(([_, val]) => !val)
            .map(([key]) => key);

        expect(missing).toHaveLength(0);
    });

    test('Email: fetches unread emails from real IMAP server', async () => {
        const result = await emailService.fetchUnreadEmails();

        expect(result).toBeDefined();
        expect(typeof result).toBe('string');

        // Verify 5-email limit
        const emailCount = (result.match(/^\d+\.\s+From:/gm) || []).length;
        expect(emailCount).toBeLessThanOrEqual(5);
    }, 15000); // 15s timeout for IMAP

    test('WhatsApp: sends real message via Twilio', async () => {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        const result = await client.messages.create({
            body: 'Jest test: WhatsApp integration working',
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: process.env.ALLOWED_NUMBERS
        });

        expect(result.sid).toBeDefined();
        expect(result.sid).toMatch(/^SM/);
    }, 10000); // 10s timeout for Twilio
});
