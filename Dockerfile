# Use Node.js 22 as specified in the project requirements
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install system dependencies that might be needed for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl

# Copy package.json files first for better Docker layer caching
COPY package*.json ./
COPY whatsapp-email-alerts/package*.json ./whatsapp-email-alerts/

# Install dependencies for the main project (updated 2025-08-20)
RUN npm install --only=production

# Install dependencies for the Twilio Functions app
WORKDIR /app/whatsapp-email-alerts
RUN npm install --only=production

# Switch back to main working directory
WORKDIR /app

# Copy the entire project
COPY . .

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port that Twilio Functions will run on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Railway environment variables (will be injected at runtime)
ARG EMAIL_HOST
ARG EMAIL_PORT
ARG EMAIL_SECURE
ARG EMAIL_USER
ARG EMAIL_PASS
ARG TWILIO_ACCOUNT_SID
ARG TWILIO_AUTH_TOKEN
ARG TWILIO_WHATSAPP_FROM
ARG ALLOWED_NUMBERS
ARG DEFAULT_LIMIT

ENV EMAIL_HOST=$EMAIL_HOST
ENV EMAIL_PORT=$EMAIL_PORT
ENV EMAIL_SECURE=$EMAIL_SECURE
ENV EMAIL_USER=$EMAIL_USER
ENV EMAIL_PASS=$EMAIL_PASS
ENV TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID
ENV TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN
ENV TWILIO_WHATSAPP_FROM=$TWILIO_WHATSAPP_FROM
ENV ALLOWED_NUMBERS=$ALLOWED_NUMBERS
ENV DEFAULT_LIMIT=$DEFAULT_LIMIT

# Health check (Railway sets PORT env var, default to 3000)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Start the Twilio Functions development server
WORKDIR /app/whatsapp-email-alerts
CMD ["npm", "start"]
