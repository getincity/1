import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import qs from 'qs';

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));

async function fetchSiteSummary(){
  try{
  const resp = await axios.get('https://gicbroadbandin.vercel.app/');
  const $ = cheerio.load(resp.data);
    const title = $('title').text() || $('h1').first().text();
    let contact = '';
    $('a').each((i,el)=>{ const href = $(el).attr('href')||''; if (href.includes('tel:') || href.includes('mailto')) contact += $(el).text() + ' ' + href + '\n'; });
    const headings = $('h1,h2').map((i,el)=>$(el).text()).get().slice(0,5).join(' | ');
    return `Site: ${title}\nHeadings: ${headings}\nContact:\n${contact}`;
  }catch(e){
    return 'Could not fetch site summary.';
  }
}

// Twilio will POST here for incoming messages
app.post('/whatsapp', async (req, res) => {
  const from = req.body.From || req.body.from || '';
  const body = (req.body.Body || req.body.body || '').trim();

  // Basic commands
  let reply = '';
  if (!body || /help/i.test(body)){
    reply = 'Welcome to GIC Broadband bot. Commands: SUMMARY, CONTACT, HOURS';
  } else if (/summary/i.test(body)){
    reply = await fetchSiteSummary();
  } else if (/contact/i.test(body)){
    reply = await fetchSiteSummary();
  } else {
    reply = 'I did not understand that. Send HELP for commands.';
  }

  // TwiML response
  const twiml = `<Response><Message>${reply}</Message></Response>`;
  res.type('text/xml').send(twiml);
});

app.get('/', (req, res) => res.send('WhatsApp bot webhook running'));

app.listen(port, ()=>console.log(`WhatsApp bot running on ${port}`));
