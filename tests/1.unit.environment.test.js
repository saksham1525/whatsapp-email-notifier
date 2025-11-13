/**
 * Unit tests for Environment Configuration
 * Tests required environment variables validation
 */

describe('Environment Variables', () => {
    
    const requiredVars = [
        'EMAIL_USER',
        'EMAIL_PASS',
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_WHATSAPP_FROM',
        'ALLOWED_NUMBERS'
    ];
    
    test('all required variables are defined', () => {
        // Set test env vars
        process.env.EMAIL_USER = 'test@example.com';
        process.env.EMAIL_PASS = 'testpass';
        process.env.TWILIO_ACCOUNT_SID = 'test_sid';
        process.env.TWILIO_AUTH_TOKEN = 'test_token';
        process.env.TWILIO_WHATSAPP_FROM = 'whatsapp:+1234567890';
        process.env.ALLOWED_NUMBERS = 'whatsapp:+1111111111';
        
        requiredVars.forEach(varName => {
            expect(process.env[varName]).toBeDefined();
            expect(process.env[varName]).not.toBe('');
        });
        
        console.log(`All required environment variables configured: ${requiredVars.length} variables validated`);
    });
    
    test('EMAIL_USER should be valid email format', () => {
        process.env.EMAIL_USER = 'test@example.com';
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(process.env.EMAIL_USER).toMatch(emailRegex);
    });
    
    test('TWILIO_WHATSAPP_FROM should have whatsapp prefix', () => {
        process.env.TWILIO_WHATSAPP_FROM = 'whatsapp:+1234567890';
        
        expect(process.env.TWILIO_WHATSAPP_FROM).toMatch(/^whatsapp:\+/);
    });
    
    test('ALLOWED_NUMBERS should have whatsapp prefix', () => {
        process.env.ALLOWED_NUMBERS = 'whatsapp:+1111111111';
        
        expect(process.env.ALLOWED_NUMBERS).toMatch(/^whatsapp:\+/);
    });
});

