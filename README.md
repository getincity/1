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

Security & options
- Client secret: optionally set `CLIENT_SECRET` in `.env`. Clients must pass this secret in the POST body as `client_secret`.
- Rate limiting: the server includes a basic rate limit (60 requests/min per IP). Adjust in `server.js`.

Deploy on Vercel

1. Create a new Vercel project, connect the repository.
2. Set Environment Variables in the project settings: `OPENAI_API_KEY` and optionally `CLIENT_SECRET`.
3. Set the Root to the repository root and the Build Command to empty. Vercel will run `npm start`.

