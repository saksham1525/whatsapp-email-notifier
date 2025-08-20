# Docker Setup for WhatsApp Email Notifier

This guide will help you run the WhatsApp Email Notifier in a Docker container, which is perfect for work environments where you can't install certain dependencies directly on your system.

## Prerequisites

1. **Docker Desktop** - Install from [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
2. **Docker Compose** - Usually included with Docker Desktop
3. **Twilio Account** - Sign up at [https://www.twilio.com](https://www.twilio.com)
4. **Email Account with IMAP** - Gmail, Outlook, etc.

## Quick Start

### 1. Initial Setup

Run the setup script to check dependencies and create configuration files:

```bash
./docker-setup.sh setup
```

This will:
- Check if Docker is installed
- Create a `.env` file from the template
- Build the Docker image

### 2. Configure Environment Variables

Edit the `.env` file with your actual credentials:

```bash
nano .env
```

**Required Configuration:**

```env
# IMAP Email Configuration
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Allowed WhatsApp Numbers (comma-separated)
ALLOWED_NUMBERS=whatsapp:+1234567890,whatsapp:+0987654321

# App Settings
DEFAULT_LIMIT=5
```

#### Getting Gmail App Password

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account settings → Security → App passwords
3. Generate a new app password for "Mail"
4. Use this 16-character password in `EMAIL_PASS`

#### Getting Twilio Credentials

1. Sign up for Twilio and verify your account
2. Go to Console → Dashboard
3. Copy your Account SID and Auth Token
4. For WhatsApp Sandbox: Console → Messaging → Try it out → WhatsApp

### 3. Start the Service

```bash
./docker-setup.sh start
```

The service will be available at `http://localhost:3000`

## Managing the Service

### Available Commands

```bash
# Start services
./docker-setup.sh start

# Stop services
./docker-setup.sh stop

# Restart services
./docker-setup.sh restart

# View status and recent logs
./docker-setup.sh status

# Follow logs in real-time
./docker-setup.sh logs

# Rebuild the image
./docker-setup.sh build

# Clean up everything
./docker-setup.sh cleanup
```

### Manual Docker Commands

If you prefer using Docker commands directly:

```bash
# Build the image
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# View running containers
docker-compose ps
```

## Testing the Setup

### 1. Health Check

Visit `http://localhost:3000/health` in your browser to verify the service is running.

### 2. WhatsApp Testing

1. Join the Twilio WhatsApp Sandbox by sending a message to the sandbox number
2. Send `help` to see available commands
3. Try `ping` for a simple response
4. Test email search: `check unseen limit:3`

### 3. Manual IMAP Testing

You can test IMAP connectivity directly:

```bash
# Enter the running container
docker-compose exec whatsapp-notifier /bin/sh

# Run the IMAP test script
node /app/scripts/test-imap.js
```

## Project Structure in Docker

```
/app/
├── whatsapp-email-alerts/     # Twilio Functions app
│   ├── functions/             # Webhook handlers
│   ├── assets/               # Static files
│   └── package.json          # Dependencies
├── serverless/src/           # Shared modules
│   └── imap.js              # Email processing
├── scripts/                 # Utility scripts
└── package.json            # Main dependencies
```

## WhatsApp Commands

Once running, you can send these commands via WhatsApp:

- `help` - Show available commands
- `ping` - Test connectivity
- `check unseen limit:5` - Check recent unread emails
- `search from:sender@email.com limit:3` - Search emails by sender
- `search subject:"Important" since:2024-01-01` - Search by subject and date

## Troubleshooting

### Service Won't Start

1. Check if port 3000 is already in use:
   ```bash
   lsof -i :3000
   ```

2. View detailed logs:
   ```bash
   ./docker-setup.sh logs
   ```

### IMAP Connection Issues

1. Verify email credentials in `.env`
2. For Gmail: ensure app password is used (not regular password)
3. Check if IMAP is enabled in your email account settings
4. Test IMAP manually:
   ```bash
   docker-compose exec whatsapp-notifier node /app/scripts/test-imap.js
   ```

### WhatsApp Not Responding

1. Verify Twilio credentials in `.env`
2. Check if your phone number is registered with Twilio sandbox
3. Ensure `ALLOWED_NUMBERS` includes your WhatsApp number with correct format
4. Check Twilio Console for webhook logs

### Environment Variables Not Loading

1. Ensure `.env` file is in the project root
2. No spaces around `=` in environment variables
3. Restart the container after changing `.env`:
   ```bash
   ./docker-setup.sh restart
   ```

## Security Notes

- The `.env` file contains sensitive credentials - never commit it to version control
- The container runs as a non-root user for security
- Only specified WhatsApp numbers in `ALLOWED_NUMBERS` can use the service
- IMAP connections use secure TLS encryption

## Updating the Application

To update the application with new code:

```bash
# Stop the service
./docker-setup.sh stop

# Rebuild with latest code
./docker-setup.sh build

# Start with new image
./docker-setup.sh start
```

## Support

If you encounter issues:

1. Check the logs: `./docker-setup.sh logs`
2. Verify your configuration in `.env`
3. Test individual components (IMAP, Twilio) separately
4. Ensure all required ports are available and not blocked by firewalls
