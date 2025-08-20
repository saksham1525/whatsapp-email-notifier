// serverless/src/imap.js
const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");

/**
 * Build IMAP connection configuration from environment variables
 * @param {Object} env - Environment variables object (defaults to process.env)
 * @returns {Object} IMAP connection configuration
 * @throws {Error} If required environment variables are missing
 */
function getImapConfigFromEnv(env = process.env) {
  const required = ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_SECURE", "EMAIL_USER", "EMAIL_PASS"];
  for (const k of required) {
    if (!env[k]) throw new Error(`Missing env var: ${k}`);
  }
  return {
    host: env.EMAIL_HOST,
    port: Number(env.EMAIL_PORT),
    secure: String(env.EMAIL_SECURE).toLowerCase() === "true",
    auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
    defaultLimit: env.DEFAULT_LIMIT || 5,
  };
}

/**
 * Connect to IMAP server, search emails based on criteria, and return formatted results
 * @param {Object} criteria - Search criteria
 * @param {boolean} [criteria.unseen] - Only return unread emails
 * @param {string} [criteria.since] - Only return emails after this date (YYYY-MM-DD)
 * @param {string} [criteria.from] - Only return emails from this sender
 * @param {string} [criteria.subject] - Only return emails with this subject text
 * @param {number} [criteria.limit] - Maximum number of results to return
 * @param {boolean} [criteria.includeSnippet] - Include body snippet in results
 * @param {Object} [cfg] - IMAP configuration (defaults to environment config)
 * @returns {Promise<Array<{date: string, from: string, subject: string, uid: number, snippet?: string}>>} Array of email metadata
 * @throws {Error} If IMAP connection or search fails
 */
async function searchEmails(criteria = {}, cfg = getImapConfigFromEnv()) {
  const client = new ImapFlow(cfg);
  await client.connect(); // establish TLS if secure=true :contentReference[oaicite:4]{index=4}

  try {
    await client.mailboxOpen("INBOX"); // select mailbox :contentReference[oaicite:5]{index=5}

    // Build IMAP search query (imapflow accepts a structured query object)
    // Docs show examples like { seen: false } and { from: 'sender' } etc. :contentReference[oaicite:6]{index=6}
    const query = {};
    if (criteria.unseen) query.seen = false;
    if (criteria.since) query.since = new Date(criteria.since);
    if (criteria.from) query.from = criteria.from;
    if (criteria.subject) query.subject = criteria.subject;

    // Run search and reverse-sort by UID so latest appear first
    const uids = await client.search(query); // returns array of UIDs :contentReference[oaicite:7]{index=7}
    const limit = Math.max(1, Number(criteria.limit || cfg.defaultLimit || 5));
    const target = uids.slice(-limit).reverse();

    const items = [];

    // Fetch headers and optionally body snippets
    const fetchOptions = { 
      source: false, 
      bodyStructure: false, 
      flags: true, 
      envelope: true, 
      internalDate: true 
    };

    // If snippets requested, also fetch text body parts (keep small to avoid timeout)
    if (criteria.includeSnippet) {
      fetchOptions.bodyParts = ['text'];
      fetchOptions.maxBytes = 500; // Limit to first 500 bytes of text to keep fast
    }

    for await (const msg of client.fetch(target, fetchOptions)) {
      // envelope contains from, subject, date
      const from = (msg.envelope?.from?.[0]?.name || msg.envelope?.from?.[0]?.address || "").trim();
      const date = msg.envelope?.date || msg.internalDate || new Date();
      const subject = (msg.envelope?.subject || "(no subject)").trim();

      const item = {
        uid: msg.uid,
        date: new Date(date).toISOString(),
        from,
        subject,
      };

      // Add snippet if requested and available
      if (criteria.includeSnippet && msg.bodyParts?.size > 0) {
        try {
          const textPart = Array.from(msg.bodyParts.values()).find(part => 
            part.type === 'text' || part.contentType?.includes('text/plain')
          );
          if (textPart) {
            const parsed = await simpleParser(textPart.data);
            const snippet = (parsed.text || parsed.textAsHtml || '').trim()
              .replace(/\s+/g, ' ')
              .slice(0, 100) + (parsed.text?.length > 100 ? '...' : '');
            if (snippet) item.snippet = snippet;
          }
        } catch (e) {
          // Skip snippet on parse error, just log and continue
          console.warn('Failed to parse email snippet:', e.message);
        }
      }

      items.push(item);
    }

    return items;
  } finally {
    await client.logout(); // end session cleanly :contentReference[oaicite:9]{index=9}
  }
}

module.exports = {
  getImapConfigFromEnv,
  searchEmails
};