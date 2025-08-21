# WhatsApp Email Notifier
FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy and install dependencies
COPY package*.json ./
COPY whatsapp-email-alerts/package*.json ./whatsapp-email-alerts/
RUN npm install

# Copy app code
COPY . .

# Install Twilio Functions dependencies  
WORKDIR /app/whatsapp-email-alerts
RUN npm install

WORKDIR /app

# Health check endpoint
HEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["npm", "start"]
