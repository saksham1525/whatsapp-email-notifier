# WhatsApp Email Notifier

A production-ready Twilio Functions webhook that enables WhatsApp users to search and retrieve emails via IMAP. Send WhatsApp messages to query your inbox and receive formatted email summaries instantly.

## Features

- **WhatsApp Integration**: Receive commands via WhatsApp and get instant responses
- **IMAP Email Search**: Search emails by sender, subject, date, and read status
- **Secure Authentication**: Whitelist-based access control for authorized users only
- **Smart Chunking**: Automatically splits long responses to stay within WhatsApp limits
- **Docker Support**: Easy deployment with full containerization support
- **Production Ready**: Built with error handling, logging, and scalable architecture

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Twilio Account](https://www.twilio.com) with WhatsApp Sandbox enabled
- Email account with IMAP access (Gmail, Outlook, etc.)
- [Docker](https://www.docker.com) (optional, for containerized deployment)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd whatsapp-email-notifier
npm install
```

### 2. Configure Environment

Copy the environment template and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Email Configuration
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Security
ALLOWED_NUMBERS=whatsapp:+1234567890,whatsapp:+0987654321

# App Settings
DEFAULT_LIMIT=5
```

### 3. Test IMAP Connection

Verify your email configuration:

```bash
node scripts/test-imap.js
```

### 4. Deploy to Twilio

```bash
cd whatsapp-email-alerts
npm install
npm run deploy
```

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EMAIL_HOST` | Yes | IMAP server hostname | `imap.gmail.com` |
| `EMAIL_PORT` | Yes | IMAP server port | `993` |
| `EMAIL_SECURE` | Yes | Use TLS/SSL connection | `true` |
| `EMAIL_USER` | Yes | Email username | `user@gmail.com` |
| `EMAIL_PASS` | Yes | Email password or app password | `abcdefghijklmnop` |
| `TWILIO_ACCOUNT_SID` | Yes | Twilio Account SID | `AC...` |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio Auth Token | `...` |
| `TWILIO_WHATSAPP_FROM` | Yes | Twilio WhatsApp number | `whatsapp:+14155238886` |
| `ALLOWED_NUMBERS` | Yes | Comma-separated authorized numbers | `whatsapp:+1234567890` |
| `DEFAULT_LIMIT` | No | Default search result limit | `5` |

### Getting Gmail App Password

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → App passwords
3. Generate a new app password for "Mail"
4. Use the 16-character password as `EMAIL_PASS`

## WhatsApp Commands

Once deployed, send these commands via WhatsApp:

- `help` - Show available commands
- `ping` - Test connectivity
- `check unseen limit:5` - Check recent unread emails
- `search from:sender@email.com limit:3` - Search by sender
- `search subject:"Important" since:2024-01-01` - Search by subject and date
- `search from:boss@company.com since:2024-01-15 limit:10` - Combined search

### Command Parameters

- `limit:<n>` - Maximum number of results (default: 5)
- `since:<yyyy-mm-dd>` - Show emails after this date
- `from:<text>` - Search by sender email or name
- `subject:<text>` - Search by subject (use quotes for phrases)

## Docker Deployment

For production deployment with Docker:

```bash
# Setup and start
./docker-setup.sh setup
./docker-setup.sh start

# View status
./docker-setup.sh status

# View logs
./docker-setup.sh logs
```

See [DOCKER.md](DOCKER.md) for detailed Docker instructions.

## Development

### Project Structure

```
├── README.md                    # This file
├── package.json                 # Shared dependencies
├── scripts/                     # Utility scripts
│   ├── loadEnv.js              # Environment loader
│   └── test-imap.js            # IMAP connection tester
├── serverless/src/             # Core modules
│   └── imap.js                 # IMAP client and search logic
├── whatsapp-email-alerts/      # Twilio Functions app
│   ├── package.json            # Twilio-specific dependencies
│   └── functions/
│       ├── health.js           # Health check endpoint
│       └── whatsapp.protected.js # Main WhatsApp webhook
└── docker-compose.yml          # Container configuration
```

### Local Testing

```bash
# Test IMAP functionality
node scripts/test-imap.js

# Run Twilio Functions locally
cd whatsapp-email-alerts
npm start

# Deploy to Twilio
npm run deploy
```

### Adding New Features

1. Core email functionality goes in `serverless/src/imap.js`
2. WhatsApp handling logic goes in `whatsapp-email-alerts/functions/whatsapp.protected.js`
3. Add utility scripts to the `scripts/` directory
4. Update environment variables in `.env.example`

## Security

- **Access Control**: Only numbers in `ALLOWED_NUMBERS` can use the service
- **Secure Connections**: All IMAP connections use TLS encryption
- **Environment Variables**: Sensitive data stored in environment variables only
- **No Data Storage**: No emails or personal data is stored or logged

## Troubleshooting

### Common Issues

**IMAP Connection Fails**
- Verify email credentials in `.env`
- Ensure IMAP is enabled in your email account
- For Gmail, use an app-specific password, not your regular password

**WhatsApp Not Responding**
- Check Twilio Console for webhook logs
- Verify `ALLOWED_NUMBERS` includes your WhatsApp number
- Ensure webhook URL is correctly configured in Twilio Console

**Deployment Issues**
- Run `npm install` in both root and `whatsapp-email-alerts/` directories
- Verify all environment variables are set
- Check Twilio Functions logs in the Console

### Getting Help

1. Check the logs: `./docker-setup.sh logs` (Docker) or Twilio Console logs
2. Test components individually using `scripts/test-imap.js`
3. Verify environment configuration matches examples

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and add tests
4. Commit changes: `git commit -am 'Add feature'`
5. Push to branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Check existing issues in the repository
- Create a new issue with detailed reproduction steps
- Include logs and environment details (without sensitive data)