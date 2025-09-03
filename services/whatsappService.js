const twilio = require('twilio');

class WhatsAppService {
    constructor() {
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.fromNumber = process.env.TWILIO_WHATSAPP_FROM;
        
        if (!this.accountSid || !this.authToken || !this.fromNumber) {
            console.error('Missing Twilio credentials in environment variables');
            throw new Error('Twilio credentials not configured');
        }
        
        this.client = twilio(this.accountSid, this.authToken);
    }

    async sendMessage(message, toNumber) {
        try {
            console.log(`Sending WhatsApp message to ${toNumber}`);
            
            const result = await this.client.messages.create({
                body: message,
                from: this.fromNumber,
                to: toNumber
            });
            
            console.log('Message sent successfully');
            return result;
            
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            throw error;
        }
    }
}

module.exports = new WhatsAppService();
