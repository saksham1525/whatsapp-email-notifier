const { loadEnv } = require("./loadEnv.js");

// Load environment variables
loadEnv();

/**
 * Validate environment configuration for WhatsApp Email Notifier
 * This script checks if all required environment variables are set correctly
 */
function validateConfig() {
  console.log("🔍 Validating WhatsApp Email Notifier Configuration");
  console.log("=" .repeat(50));

  const required = [
    {
      key: "EMAIL_HOST",
      description: "IMAP server hostname (e.g., imap.gmail.com)",
      example: "imap.gmail.com"
    },
    {
      key: "EMAIL_PORT", 
      description: "IMAP server port (usually 993 for SSL)",
      example: "993",
      validate: (val) => !isNaN(val) && parseInt(val) > 0
    },
    {
      key: "EMAIL_SECURE",
      description: "Use secure connection (true/false)", 
      example: "true",
      validate: (val) => val === "true" || val === "false"
    },
    {
      key: "EMAIL_USER",
      description: "Email username/address",
      example: "your-email@gmail.com",
      validate: (val) => val.includes("@")
    },
    {
      key: "EMAIL_PASS",
      description: "Email password or app password",
      example: "app-password",
      validate: (val) => val.length >= 8
    },
    {
      key: "TWILIO_ACCOUNT_SID",
      description: "Twilio Account SID",
      example: "AC1234567890abcdef1234567890abcdef",
      validate: (val) => val.startsWith("AC") && val.length === 34
    },
    {
      key: "TWILIO_AUTH_TOKEN", 
      description: "Twilio Auth Token",
      example: "your-auth-token",
      validate: (val) => val.length >= 30
    },
    {
      key: "TWILIO_WHATSAPP_FROM",
      description: "Twilio WhatsApp number",
      example: "whatsapp:+14155238886",
      validate: (val) => val.startsWith("whatsapp:+")
    },
    {
      key: "ALLOWED_NUMBERS",
      description: "Authorized WhatsApp numbers (comma-separated)",
      example: "whatsapp:+1234567890,whatsapp:+0987654321",
      validate: (val) => val.includes("whatsapp:+")
    }
  ];

  const optional = [
    {
      key: "DEFAULT_LIMIT",
      description: "Default search result limit",
      example: "5",
      validate: (val) => !isNaN(val) && parseInt(val) > 0
    }
  ];

  let hasErrors = false;
  let warnings = [];

  console.log("✅ Required Configuration:");
  console.log("-".repeat(25));

  // Check required variables
  for (const config of required) {
    const value = process.env[config.key];
    
    if (!value) {
      console.log(`❌ ${config.key}: MISSING`);
      console.log(`   ${config.description}`);
      console.log(`   Example: ${config.example}\n`);
      hasErrors = true;
    } else if (config.validate && !config.validate(value)) {
      console.log(`⚠️  ${config.key}: INVALID FORMAT`);
      console.log(`   Current: ${value.slice(0, 20)}${value.length > 20 ? '...' : ''}`);
      console.log(`   ${config.description}`);
      console.log(`   Example: ${config.example}\n`);
      hasErrors = true;
    } else {
      console.log(`✅ ${config.key}: OK`);
    }
  }

  console.log("\n📋 Optional Configuration:");
  console.log("-".repeat(25));

  // Check optional variables
  for (const config of optional) {
    const value = process.env[config.key];
    
    if (!value) {
      console.log(`⚪ ${config.key}: Using default`);
      warnings.push(`Consider setting ${config.key} (${config.description})`);
    } else if (config.validate && !config.validate(value)) {
      console.log(`⚠️  ${config.key}: INVALID FORMAT`);
      console.log(`   Current: ${value}`);
      console.log(`   ${config.description}`);
      console.log(`   Example: ${config.example}`);
    } else {
      console.log(`✅ ${config.key}: ${value}`);
    }
  }

  // Show summary
  console.log("\n" + "=".repeat(50));
  
  if (hasErrors) {
    console.log("❌ Configuration validation FAILED");
    console.log("   Please fix the errors above before deploying.");
    console.log("\n💡 Tips:");
    console.log("   - For Gmail: Use app passwords instead of regular password");
    console.log("   - Check Twilio Console for correct SID and Auth Token");
    console.log("   - WhatsApp numbers must include country code");
    process.exit(1);
  } else {
    console.log("✅ Configuration validation PASSED");
    console.log("   All required settings are configured correctly.");
    
    if (warnings.length > 0) {
      console.log("\n⚠️  Optional recommendations:");
      warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    console.log("\n🚀 Ready to deploy! Next steps:");
    console.log("   1. Test IMAP: npm run test");
    console.log("   2. Deploy: npm run deploy"); 
    console.log("   3. Configure WhatsApp webhook in Twilio Console");
  }
}

// Self-executing validation
if (require.main === module) {
  validateConfig();
}

module.exports = { validateConfig };
