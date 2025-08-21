/**
 * IMAP connection test utility
 * Tests email search functionality with sample criteria
 */

const { searchEmails } = require("../serverless/imap.js");

(async () => {
  console.log("Testing IMAP connection...");
  
  try {
    const emails = await searchEmails({
      unseen: true,
      limit: 3
    });
    
    console.log(`SUCCESS: Found ${emails.length} emails`);
    console.log(JSON.stringify(emails, null, 2));
    
  } catch (error) {
    console.error("ERROR: IMAP test failed:", error.message);
    process.exit(1);
  }
})();