require('dotenv').config();

console.log('Validating environment configuration...');

const requiredVars = [
    'EMAIL_HOST',
    'EMAIL_USER',
    'EMAIL_PASS',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_WHATSAPP_FROM',
    'ALLOWED_NUMBERS'
];

const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('ERROR: Missing required environment variables:');
    missingVars.forEach((varName) => {
        console.error(`  - ${varName}`);
    });
    console.error('\nPlease set these variables in your .env file');
    process.exit(1);
}

console.log('SUCCESS: All required environment variables are set');
console.log(`Email: ${process.env.EMAIL_USER}`);
console.log(`Twilio SID: ${process.env.TWILIO_ACCOUNT_SID.slice(0, 8)}...`);
console.log(`WhatsApp From: ${process.env.TWILIO_WHATSAPP_FROM}`);
console.log(`Authorized Numbers: ${process.env.ALLOWED_NUMBERS}`);
