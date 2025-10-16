WhatsApp Bot (Twilio webhook)

This small Express webhook responds to incoming WhatsApp messages from Twilio.

Features
- Replies to simple commands: SUMMARY, CONTACT, HELP
- Scrapes the target site for headings and contact links

Setup

1. Install dependencies:

```powershell
cd whatsapp-bot
npm install
```

2. Run locally (for testing) and expose a public URL using ngrok:

```powershell
node server.js
# in another terminal: ngrok http 5000
```

3. In Twilio Console, configure your WhatsApp sandbox/webhook URL to point to the ngrok URL + `/whatsapp`.
4. Test by sending messages to your Twilio WhatsApp number.

Notes
- This is a basic scaffold; adjust parsing rules to match your site's structure.
- For outbound messages you will need Twilio REST API credentials (ACCOUNT SID and AUTH TOKEN) and their WhatsApp-Enabled number.
