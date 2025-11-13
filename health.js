/**
 * Integration health tests for WhatsApp Email Notifier
 * Tests: Environment config, Email service, WhatsApp service
 */

require('dotenv').config();
const emailService = require('./services/emailService');
const twilio = require('twilio');

// Test 1: Environment Variables
async function testEnvironment() {
    console.log('\n=== Test 1: Environment Variables ===');

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

    if (missing.length > 0) {
        console.error('❌ FAIL: Missing variables:', missing.join(', '));
        return false;
    }

    console.log('✅ PASS: All required variables set');
    return true;
}

// Test 2: Email Service
async function testEmail() {
    console.log('\n=== Test 2: Email Service (IMAP) ===');
    console.log(
        `Host: ${process.env.EMAIL_HOST || 'imap.gmail.com'}:${process.env.EMAIL_PORT || 993}`
    );

    try {
        const result = await emailService.fetchUnreadEmails();
        console.log('✅ PASS: Email fetch successful');

        // Verify 5-email limit is respected
        const emailCount = (result.match(/^\d+\.\s+From:/gm) || []).length;
        console.log(`Emails displayed: ${emailCount} (max 5)`);

        if (emailCount > 5) {
            console.error('⚠️  WARNING: Limit exceeded! Showing more than 5 emails');
            return false;
        }

        return true;
    } catch (error) {
        console.error('❌ FAIL:', error.message);
        console.error('Details:', error.code || error.errno || 'See error above');
        return false;
    }
}

// Test 3: WhatsApp Service
async function testWhatsApp() {
    console.log('\n=== Test 3: WhatsApp Service (Twilio) ===');
    console.log(`From: ${process.env.TWILIO_WHATSAPP_FROM} → To: ${process.env.ALLOWED_NUMBERS}`);

    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        const result = await client.messages.create({
            body: 'Health check: WhatsApp integration working ✓',
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: process.env.ALLOWED_NUMBERS
        });

        console.log('✅ PASS: Message sent');
        console.log(`Message SID: ${result.sid}`);
        return true;
    } catch (error) {
        console.error('❌ FAIL:', error.message);
        console.error(`Error code: ${error.code} | Status: ${error.status}`);
        if (error.moreInfo) console.error(`More info: ${error.moreInfo}`);
        return false;
    }
}

// Run all tests
async function runHealthChecks() {
    console.log('🏥 Running Health Checks...');

    const results = {
        environment: await testEnvironment(),
        email: await testEmail(),
        whatsapp: await testWhatsApp()
    };

    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;

    console.log(`\n${'='.repeat(40)}`);
    console.log(`Results: ${passed}/${total} tests passed`);
    console.log(`${'='.repeat(40)}\n`);

    process.exit(passed === total ? 0 : 1);
}

runHealthChecks();
