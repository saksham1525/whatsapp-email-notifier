# WhatsApp Email Notifier

Email alerts via WhatsApp using Twilio and IMAP. Send commands to WhatsApp and get your email summaries instantly.

## Quick Setup

### 1. Install Dependencies
```bash
git clone <repository-url>
cd whatsapp-email-notifier
npm install
cd whatsapp-email-alerts && npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory with your configuration:

```env
# Email Configuration
EMAIL_HOST=imap.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Twilio Configuration  
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Security (optional)
ALLOWED_NUMBERS=whatsapp:+1234567890
```

### 3. Test & Deploy

**Test IMAP connection:**
```bash
npm run test
```

**Deploy to Twilio:**
```bash
npm run deploy
```

**Run with Docker:**
```bash
docker-compose up -d
```

## WhatsApp Commands

- `help` - Show available commands
- `ping` - Test connection
- `check unseen` - Get unread emails
- `search from:sender@email.com` - Search by sender
- `latest` - Get recent emails

## Gmail Setup

1. Enable 2-Factor Authentication
2. Generate App Password: Google Account → Security → App passwords  
3. Use the 16-character app password as `EMAIL_PASS`

## Twilio Setup

1. Sign up at [twilio.com](https://twilio.com)
2. Get Account SID and Auth Token from Console
3. Join WhatsApp Sandbox: Console → Messaging → Try WhatsApp
4. Configure webhook URL in sandbox settings

## Project Structure

```
├── serverless/src/imap.js           # Email search functionality
├── whatsapp-email-alerts/           # Twilio Functions app
├── scripts/test-imap.js             # IMAP testing
├── docker-compose.yml              # Docker setup
└── README.md                       # This file
```

## Troubleshooting

- **IMAP fails**: Check email credentials and enable IMAP in your email account
- **WhatsApp not responding**: Verify Twilio credentials and webhook URL  
- **Permission denied**: Make sure your WhatsApp number is in `ALLOWED_NUMBERS`

## License

MIT