/**
 * Integration tests - full pipeline working together (mocked)
 * Tests the actual app.js flow: Environment → Email → WhatsApp
 */

jest.mock('twilio');
jest.mock('imap-simple');

const twilio = require('twilio');
const imaps = require('imap-simple');

describe('Integration - Full Pipeline (Mocked)', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.EMAIL_USER = 'test@example.com';
        process.env.EMAIL_PASS = 'testpass';
        process.env.TWILIO_ACCOUNT_SID = 'test_sid';
        process.env.TWILIO_AUTH_TOKEN = 'test_token';
        process.env.TWILIO_WHATSAPP_FROM = 'whatsapp:+1234567890';
        process.env.ALLOWED_NUMBERS = 'whatsapp:+1111111111';
    });
    
    test('Full pipeline: Fetch emails and send via WhatsApp', async () => {
        console.log('Starting integration test: Full pipeline');
        
        // Step 1: Validate environment
        const required = ['EMAIL_USER', 'EMAIL_PASS', 'TWILIO_ACCOUNT_SID', 
                         'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_FROM', 'ALLOWED_NUMBERS'];
        const missing = required.filter(key => !process.env[key]);
        expect(missing).toHaveLength(0);
        console.log('Step 1: Environment validated');
        
        // Step 2: Mock IMAP and fetch emails
        const mockConnection = {
            openBox: jest.fn().mockResolvedValue({}),
            search: jest.fn().mockResolvedValue([
                {
                    parts: [{
                        which: 'HEADER',
                        body: {
                            subject: ['Important: Project Update'],
                            from: ['boss@company.com'],
                            date: ['2025-01-15']
                        }
                    }]
                }
            ]),
            end: jest.fn()
        };
        imaps.connect = jest.fn().mockResolvedValue(mockConnection);
        
        delete require.cache[require.resolve('../services/emailService')];
        const emailService = require('../services/emailService');
        
        const emailResult = await emailService.fetchUnreadEmails();
        expect(emailResult).toContain('Important: Project Update');
        expect(emailResult).toContain('boss@company.com');
        console.log('Step 2: Emails fetched from IMAP');
        
        // Step 3: Mock Twilio and send email content via WhatsApp
        const mockCreate = jest.fn().mockResolvedValue({ sid: 'MSG789' });
        twilio.mockReturnValue({
            messages: { create: mockCreate }
        });
        
        delete require.cache[require.resolve('../services/whatsappService')];
        const whatsappService = require('../services/whatsappService');
        
        // This is the key integration: email output → WhatsApp input
        const whatsappResult = await whatsappService.sendMessage(
            emailResult, // Using the fetched email as WhatsApp message
            process.env.ALLOWED_NUMBERS
        );
        
        expect(mockCreate).toHaveBeenCalledWith({
            body: emailResult, // Verify email content is sent
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: process.env.ALLOWED_NUMBERS
        });
        expect(whatsappResult.sid).toBe('MSG789');
        console.log('Step 3: Email content sent via WhatsApp');
        
        console.log('Full pipeline test passed: Environment -> Email -> WhatsApp');
    });
});
