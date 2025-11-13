/**
 * Unit tests for Email Service
 */

jest.mock('imap-simple');

const emailService = require('../services/emailService');
const imaps = require('imap-simple');

describe('EmailService', () => {
    test('extracts email info correctly', () => {
        const mockMessage = {
            parts: [
                {
                    which: 'HEADER',
                    body: {
                        subject: ['Test Subject'],
                        from: ['sender@example.com'],
                        date: ['2025-01-01']
                    }
                }
            ]
        };

        const result = emailService.extractEmailInfo(mockMessage);

        expect(result).toBeDefined();
        expect(result.subject).toBe('Test Subject');
        expect(result.from).toBe('sender@example.com');
    });

    test('connects to IMAP server and fetches emails', async () => {
        const mockConnection = {
            openBox: jest.fn().mockResolvedValue({}),
            search: jest.fn().mockResolvedValue([
                {
                    parts: [
                        {
                            which: 'HEADER',
                            body: {
                                subject: ['Test Email'],
                                from: ['sender@test.com'],
                                date: ['2025-01-01']
                            }
                        }
                    ]
                }
            ]),
            end: jest.fn()
        };

        imaps.connect = jest.fn().mockResolvedValue(mockConnection);

        const result = await emailService.fetchUnreadEmails();

        expect(imaps.connect).toHaveBeenCalled();
        expect(mockConnection.openBox).toHaveBeenCalledWith('INBOX');
        expect(mockConnection.search).toHaveBeenCalledWith(['UNSEEN'], expect.any(Object));
        expect(result).toContain('Test Email');
        expect(mockConnection.end).toHaveBeenCalled();
    });
});
