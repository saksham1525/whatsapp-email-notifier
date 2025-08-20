// serverless/src/imap.js
const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");

/**
 * Build connection opts from env
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
  };
}

/**
 * Connect, open INBOX, run a time-bounded search, fetch headers.
 * @param {Object} opts - { unseen, since, from, subject, limit }
 * @returns {Promise<Array<{date, from, subject, uid}>>}
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
    const limit = Math.max(1, Number(criteria.limit || process.env.DEFAULT_LIMIT || 5));
    const target = uids.slice(-limit).reverse();

    const items = [];

    // Fetch headers only; avoid full bodies to keep execution fast.
    // imapflow fetch examples show envelope/header fetching to be lightweight. :contentReference[oaicite:8]{index=8}
    for await (const msg of client.fetch(target, { source: false, bodyStructure: false, flags: true, envelope: true, internalDate: true })) {
      // envelope contains from, subject, date; if you want extra robustness, parse headers via mailparser
      const from = (msg.envelope?.from?.[0]?.name || msg.envelope?.from?.[0]?.address || "").trim();
      const date = msg.envelope?.date || msg.internalDate || new Date();
      const subject = (msg.envelope?.subject || "(no subject)").trim();

      items.push({
        uid: msg.uid,
        date: new Date(date).toISOString(),
        from,
        subject,
      });
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