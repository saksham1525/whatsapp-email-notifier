# WhatsApp Email Notifier

A WhatsApp bot that connects Gmail (IMAP) with Twilio WhatsApp to provide email summaries on-demand via WhatsApp commands.

## Architecture

```
├── app.js                    # Main Express server & webhook handler
├── services/
│   ├── emailService.js      # IMAP email fetching (Gmail connection)
│   └── whatsappService.js   # Twilio WhatsApp messaging
├── .env                     # Environment variables
└── package.json             # Dependencies and scripts
```

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Gmail Setup
1. Enable 2FA on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → App passwords
   - Generate password for "Mail"
3. Enable IMAP access in Gmail settings

### 3. Twilio Setup
1. Create Twilio account at console.twilio.com
2. Set up WhatsApp Sandbox:
   - Go to Messaging → Try it out → Send a WhatsApp message
   - Note your sandbox number (e.g., +1 415 523 8886)
   - Join sandbox by sending required message
3. Configure webhook URL (will be your Railway URL + /whatsapp)
4. Get Account SID and Auth Token from Dashboard

### 4. Environment Configuration
Copy `.env.example` to `.env` and configure with your credentials.

### 5. Validate Configuration
```bash
npm run validate
```

### 6. Railway Deployment
```bash
# Install Railway CLI
sudo npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables
railway variables set EMAIL_USER=your-email@gmail.com
railway variables set EMAIL_PASS=your-app-password
# ... set all other variables

# Get your deployment URL
railway domain
```

**Note:** Railway automatically runs `npm start` to launch your application after deployment.

### 7. Verify Deployment
```bash
# Health check
curl https://your-railway-url.up.railway.app/health

# Expected response:
{"ok":true,"service":"whatsapp-email-notifier","version":"2.0.0"}
```

### 8. Configure Twilio Webhook
1. Go to Twilio Console → WhatsApp Sandbox
2. Set webhook URL to: `https://your-railway-url.up.railway.app/whatsapp`
3. Save configuration

**Note:** Check Twilio console logs for webhook and messaging errors if you encounter issues.

## Features

### Email Processing
- Connect to Gmail via IMAP
- Fetch unread emails
- Message truncation for WhatsApp compatibility

### WhatsApp Integration
- Receive commands via WhatsApp
- Send formatted email summaries
- Authorization checks for security

### Error Handling
- IMAP connection failures
- Unauthorized access blocking
- Invalid command responses

## Available Commands

### Basic Commands
- `help` - Show available commands
- `ping` - Test connection
- `check` - Check unread emails
- `about` - Service information

### Command Examples
```
User: ping
Bot: Service is running successfully

User: check
Bot: Found 3 unread email(s):

1.  From: boss@company.com
    Subject: Quarterly Review
    Date: 9/2/2024
```

## Performance Notes
- IMAP connections are efficiently managed
- Automatic message truncation for WhatsApp length limits
- Async processing prevents blocking operations
