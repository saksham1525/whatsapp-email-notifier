const { loadEnv } = require("./loadEnv.js");
const { searchEmails } = require("../serverless/src/imap.js");

loadEnv(); // loads .env.local.email

(async () => {
  const items = await searchEmails({
    unseen: true,
    since: "2025-08-01",
    from: "",          // leave empty to ignore
    subject: "",       // leave empty to ignore
    limit: 3,
  });
  console.log(JSON.stringify(items, null, 2));
})().catch((e) => {
  console.error("IMAP test failed:", e);
  process.exit(1);
});