# GPT-5-mini Proxy

This small Node.js Express proxy lets client-side apps call OpenAI's `gpt-5-mini` model without exposing your API key.

Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your OpenAI API key:

```
OPENAI_API_KEY=sk-xxxxx
```

3. Run locally:

```bash
npm start
```

Example request (client side):

POST /api/generate

Body: { "prompt": "Write a short poem about code." }

Deploy

You can deploy this to Vercel, Heroku, or any Node hosting. Make sure to set the `OPENAI_API_KEY` secret in the platform.
