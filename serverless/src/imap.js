const { ImapFlow } = require("imapflow");

/**
 * Creates IMAP connection configuration from environment variables
 * @param {Object} env - Environment variables object
 * @returns {Object} IMAP configuration object
 */
function getImapConfig(env = process.env) {
  return {
    host: env.EMAIL_HOST || 'imap.gmail.com',
    port: Number(env.EMAIL_PORT) || 993,
    secure: true,
    auth: { 
      user: env.EMAIL_USER, 
      pass: env.EMAIL_PASS 
    }
  };
}

/**
 * Searches emails based on specified criteria
 * @param {Object} criteria - Search criteria (unseen, from, subject, since, limit)  
 * @param {Object} config - IMAP configuration
 * @returns {Promise<Array>} Array of email objects with date, from, subject
 */
async function searchEmails(criteria = {}, config = null) {
  const cfg = config || getImapConfig();
  const client = new ImapFlow(cfg);
  
  await client.connect();

  try {
    await client.mailboxOpen("INBOX");

    // Build search query
    const query = {};
    if (criteria.unseen) query.seen = false;
    if (criteria.since) query.since = new Date(criteria.since);
    if (criteria.from) query.from = criteria.from;
    if (criteria.subject) query.subject = criteria.subject;

    // Search and get latest emails first
    const uids = await client.search(query);
    const limit = Number(criteria.limit) || 5;
    const targetUids = uids.slice(-limit).reverse();

    const emails = [];

    // Fetch email headers
    for await (const message of client.fetch(targetUids, { 
      envelope: true, 
      flags: true 
    })) {
      const email = {
        uid: message.uid,
        date: new Date(message.envelope.date).toISOString(),
        from: message.envelope.from?.[0]?.address || 'Unknown',
        subject: message.envelope.subject || '(no subject)'
      };
      emails.push(email);
    }

    return emails;
  } finally {
    await client.logout();
  }
}

module.exports = {
  getImapConfig,
  searchEmails
};