// WhatsApp webhook: parse commands, auth sender, run IMAP, reply with TwiML + optional follow-ups via REST.

const { MessagingResponse } = require("twilio").twiml;

// Load our shared IMAP module. Fixed path for Railway deployment.
const { searchEmails, getImapConfigFromEnv } = require("../../serverless/src/imap.js");

// Utility: safe env lookup (Twilio Functions expose env via `context`, Railway via process.env)
function envOrThrow(context, key) {
  const v = context[key] || process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}

// Chunk long text to keep under ~1600 chars (Twilio body limit). :contentReference[oaicite:21]{index=21}
function chunkBody(text, max = 1400) { // 1400 to leave headroom for formatting
  const out = [];
  let i = 0;
  while (i < text.length) {
    out.push(text.slice(i, i + max));
    i += max;
  }
  return out;
}

exports.handler = async function handler(context, event, callback) {
  try {
    // Twilio sends form-encoded params like Body, From to your webhook. :contentReference[oaicite:22]{index=22}
    const body = (event.Body || "").trim();
    const from = (event.From || "").trim();

    // Authorization: allow only numbers in ALLOWED_NUMBERS
    const allowed = String(envOrThrow(context, "ALLOWED_NUMBERS"))
      .split(",")
      .map((s) => s.trim());
    if (!allowed.includes(from)) {
      const twiml = new MessagingResponse();
      twiml.message("Unauthorized.");
      return callback(null, twiml);
    }

    // Parse minimal commands
    const lower = body.toLowerCase();
    if (lower === "help") {
      const twiml = new MessagingResponse();
      twiml.message(
        [
          "Commands:",
          "help",
          "ping",
          "check unseen [limit:<n>] [since:<yyyy-mm-dd>]",
          "search from:<text> subject:<text> since:<yyyy-mm-dd> limit:<n>",
        ].join("\n")
      );
      return callback(null, twiml);
    }

    if (lower === "ping") {
      const twiml = new MessagingResponse();
      twiml.message("pong");
      return callback(null, twiml);
    }

    // Parse 'check unseen ...' or 'search ...' (very small grammar)
    const isCheck = lower.startsWith("check unseen");
    const isSearch = lower.startsWith("search ");
    if (!isCheck && !isSearch) {
      const twiml = new MessagingResponse();
      twiml.message("Unrecognized. Send 'help' for usage.");
      return callback(null, twiml);
    }

    // Extract key:value tokens
    const tokens = body
      .split(/\s+/)
      .slice(isCheck ? 2 : 1) // skip 'check unseen' or 'search'
      .join(" ")
      .match(/(\w+):("[^"]+"|\S+)/g) || [];

    const args = {};
    for (const t of tokens) {
      const [k, v] = t.split(":");
      args[k.toLowerCase()] = v.replace(/^"|"$/g, "");
    }

    // Build criteria
    const criteria = {
      unseen: isCheck ? true : undefined,
      since: args.since,
      from: args.from,
      subject: args.subject,
      limit: args.limit ? Number(args.limit) : undefined,
    };

    // Run IMAP search
    const items = await searchEmails(criteria, getImapConfigFromEnv(context));

    // Format compact lines
    const lines = items.map(
      (it) => `• ${new Date(it.date).toISOString().slice(0, 10)} — ${it.from} — ${it.subject}`
    );
    const header = items.length ? `Found ${items.length} item(s):` : "No matching emails.";
    const payload = [header, ...lines].join("\n");

    // Chunk reply: 1st chunk via TwiML response; any remaining chunks via REST API
    const chunks = chunkBody(payload);

    const twiml = new MessagingResponse();
    twiml.message(chunks[0] || "No matching emails.");
    // Return immediately; Function stops executing after callback. :contentReference[oaicite:23]{index=23}

    // If extra chunks exist, send them out-of-band using REST after callback()
    const client = context.getTwilioClient(); // Twilio Node SDK in Functions context :contentReference[oaicite:24]{index=24}
    const fromAddr = envOrThrow(context, "TWILIO_WHATSAPP_FROM");

    // Fire-and-forget sequentially; if runtime ends early, users will still get the first chunk via TwiML.
    (async () => {
      for (let i = 1; i < chunks.length; i++) {
        await client.messages.create({
          from: fromAddr,
          to: from,
          body: chunks[i],
        });
      }
    })().catch((e) => console.error("Chunk send failed:", e));

    return callback(null, twiml);
  } catch (err) {
    console.error(err);
    const twiml = new MessagingResponse();
    twiml.message("Error. Try again or send 'help'.");
    return callback(null, twiml);
  }
};