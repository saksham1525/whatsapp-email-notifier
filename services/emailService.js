const imaps = require('imap-simple');

class EmailService {
    constructor() {
        this.config = {
            imap: {
                user: process.env.EMAIL_USER,
                password: process.env.EMAIL_PASS,
                host: process.env.EMAIL_HOST || 'imap.gmail.com',
                port: parseInt(process.env.EMAIL_PORT) || 993,
                tls: true,
                authTimeout: 10000,
                tlsOptions: { rejectUnauthorized: false },
                authMethods: ['PLAIN', 'LOGIN', 'XOAUTH2'] // Authentication methods
            }
        };
    }

    async connect() {
        try {
            console.log('Connecting to IMAP server...');
            const connection = await imaps.connect(this.config);
            console.log('Connected to IMAP server successfully');
            return connection;
        } catch (error) {
            console.error('IMAP connection failed:', error);
            throw error;
        }
    }

    extractEmailInfo(message) {
        const header = message.parts?.find(part => part.which === 'HEADER');
        if (!header?.body) return null;

        return {
            subject: header.body.subject?.[0] || '(No Subject)',
            from: header.body.from?.[0] || '(Unknown Sender)',
            date: header.body.date ? new Date(header.body.date[0]).toLocaleDateString() : '(No Date)'
        };
    }

    async fetchUnreadEmails(limit = 5) {
        try {
            const connection = await this.connect();
            await connection.openBox('INBOX');
            
            const searchCriteria = ['UNSEEN'];
            const fetchOptions = {
                bodies: ['HEADER'],
                limit: limit
            };

            const messages = await connection.search(searchCriteria, fetchOptions);
            
            if (messages.length === 0) {
                connection.end();
                return 'No unread emails found.';
            }

            let display = `Found ${messages.length} unread email(s):\n\n`;
            
            messages.forEach((message, index) => {
                const emailInfo = this.extractEmailInfo(message);
                if (emailInfo) {
                    display += `${index + 1}.  From: ${emailInfo.from}\n`;
                    display += `    Subject: ${emailInfo.subject}\n`;
                    display += `    Date: ${emailInfo.date}\n\n`;
                } else {
                    display += `${index + 1}.  Error: Could not read email\n\n`;
                }
            });

            connection.end();
            
            const maxLength = 1500; // WhatsApp message limit
            if (display.length > maxLength) {
                display = display.slice(0, maxLength - 3) + '...';
            }
            
            return display;

        } catch (error) {
            console.error('Error fetching unread emails:', error);
            return 'Error fetching emails. Please try again later.';
        }
    }
}

module.exports = new EmailService();
