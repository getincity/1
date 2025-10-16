const axios = require('axios');
const cheerio = require('cheerio');

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

module.exports = async function handler(req, res) {
  if (req.method === 'POST'){
    const body = (req.body.Body || req.body.body || '') .trim();
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
    const twiml = `<Response><Message>${reply}</Message></Response>`;
    res.setHeader('Content-Type','text/xml');
    res.status(200).send(twiml);
  } else {
    res.status(200).send('OK');
  }
}
