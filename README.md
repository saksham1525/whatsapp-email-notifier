# WhatsApp Email Notifier

A WhatsApp bot that connects Gmail (IMAP) with Twilio WhatsApp to provide email summaries on-demand via WhatsApp commands.

## Setup

**Requirements:** Node.js >= 20.17.0

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

### 6. Run Tests
```bash
npm test
```

### 7. Local Testing (Optional)
For local webhook testing without deploying:

```bash
# Install ngrok
npm install -g ngrok

# Start your app
npm start

# In another terminal, expose localhost
ngrok http 3000
```

Ngrok creates a public URL for your localhost, allowing Twilio to send webhooks to your local machine. Use the ngrok URL (e.g., `https://abc123.ngrok.io/whatsapp`) in Twilio webhook settings.

### 8. Railway Deployment
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
# ...

# Get your deployment URL
railway domain
```

**Deployment Notes:**
- Railway automatically deploys on every push to `main` branch (if connected to GitHub)
- Runs `npm start` to launch the application
- Environment variables must be set in Railway dashboard or CLI

### 9. Verify Deployment
```bash
# Health check
curl https://your-railway-url.up.railway.app/health

# Expected response:
{"ok":true,"service":"whatsapp-email-notifier","version":"2.0.0"}
```

### 10. Configure Twilio Webhook
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

## Testing

### Test Suite
The project includes comprehensive Jest tests:

**Unit Tests** (Fast, mocked)
- Environment variable validation
- Email parsing logic
- WhatsApp service functionality

**Integration Tests** (Mocked APIs)
- Full pipeline: Environment → Email → WhatsApp
- No external API calls (cost-free)

**Integration Tests** (Real APIs)
- Tests actual Gmail IMAP connection
- Tests actual Twilio WhatsApp messaging
- **Warning:** Makes real API calls (skipped by default - remove `.skip` in test file to run)

### Running Tests
```bash
# Run all tests
npm test

# Run health check with real APIs
npm run health
```

### Code Quality & CI/CD

**Pre-commit Hooks**
On every commit, Prettier and ESLint automatically format and lint your code.

**GitHub Actions CI/CD**
Runs on every push and pull request:
- Code formatting check
- Linting
- Full test suite
- Railway auto-deploys on merge to `main` (when connected to GitHub)

### Test Execution Order
Tests run in optimized sequence:
1. Unit tests (environment, email, WhatsApp)
2. Mocked integration tests (full pipeline)
3. Real API integration tests

## Performance Notes
- IMAP connections are efficiently managed
- Automatic message truncation for WhatsApp length limits
- Async processing prevents blocking operations
