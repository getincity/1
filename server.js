// Minimal Express server that proxies requests to OpenAI's API for model `gpt-5-mini`.
// Usage: set OPENAI_API_KEY in environment (or via .env) and run `node server.js`.

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in environment');
  process.exit(1);
}

// Optional client secret - set CLIENT_SECRET in .env and require clients to send it
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';

app.use(express.json());

// Rate limiter: 60 requests per minute per IP by default
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

app.post('/api/generate', async (req, res) => {
  const { prompt, max_tokens = 256, client_secret } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  if (CLIENT_SECRET && client_secret !== CLIENT_SECRET) {
    return res.status(403).json({ error: 'invalid client secret' });
  }

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
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Serve a tiny client example
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/public/index.html')));

app.listen(port, () => console.log(`Server listening on port ${port}`));
