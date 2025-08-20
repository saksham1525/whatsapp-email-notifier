# WhatsApp Email Notifier - Docker Image
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Install system dependencies for better networking and debugging
RUN apk add --no-cache curl

# Copy package files for dependency installation
COPY package*.json ./
COPY whatsapp-email-alerts/package*.json ./whatsapp-email-alerts/

# Install dependencies (production only for smaller image)
RUN npm ci --only=production

# Copy application code
COPY . .

# Install Twilio Functions dependencies
WORKDIR /app/whatsapp-email-alerts
RUN npm ci --only=production

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chmod 755 /app/logs

# Use non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 nodeapp -G nodejs
    
# Change ownership of app directory to non-root user
RUN chown -R nodeapp:nodejs /app

# Switch to non-root user
USER nodeapp

# Set working directory back to app root
WORKDIR /app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Expose port
EXPOSE 3000

# Start the Twilio Functions service
CMD ["npm", "start"]
