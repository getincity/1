// Minimal Express server that proxies requests to OpenAI's API for model `gpt-5-mini`.
// Usage: set OPENAI_API_KEY in environment (or via .env) and run `node server.js`.

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in environment');
  process.exit(1);
}

app.use(express.json());

app.post('/api/generate', async (req, res) => {
  const { prompt, max_tokens = 256 } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  try {
    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        input: prompt,
        max_tokens
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).send(text);
    }

    const data = await resp.json();
    // Return the whole response to the client; you can transform as needed.
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/', (req, res) => res.send('GPT-5-mini proxy running'));

app.listen(port, () => console.log(`Server listening on port ${port}`));
