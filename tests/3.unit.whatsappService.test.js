/**
 * Unit tests for WhatsApp Service
 */

jest.mock('twilio');

const twilio = require('twilio');

describe('WhatsAppService - sendMessage', () => {
    test('sends message with correct parameters', async () => {
        process.env.TWILIO_ACCOUNT_SID = 'test_sid';
        process.env.TWILIO_AUTH_TOKEN = 'test_token';
        process.env.TWILIO_WHATSAPP_FROM = 'whatsapp:+1234567890';

        const mockCreate = jest.fn().mockResolvedValue({ sid: 'MSG123' });
        twilio.mockReturnValue({
            messages: { create: mockCreate }
        });

        delete require.cache[require.resolve('../services/whatsappService')];
        const whatsappService = require('../services/whatsappService');

        const result = await whatsappService.sendMessage('Test', 'whatsapp:+1111111111');

        expect(result.sid).toBeDefined();
        expect(mockCreate).toHaveBeenCalled();
    });
});
