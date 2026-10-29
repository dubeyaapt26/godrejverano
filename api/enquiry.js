// Vercel serverless function: emails every enquiry to the site mailbox.
// Needs SMTP_USER and SMTP_PASS set in Vercel project settings (GoDaddy mailbox login).
const nodemailer = require('nodemailer');

const TO = 'aaptdubey@godrejverano.org';
const ALLOWED_ORIGINS = ['https://godrejverano.org', 'https://www.godrejverano.org', 'http://localhost:8765'];

function clean(v, max) {
  return String(v || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return res.status(503).json({ ok: false, error: 'mail not configured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  if (body._honey) return res.status(200).json({ ok: true }); // bot

  const name = clean(body.name, 120);
  const phone = clean(body.phone, 20);
  const email = clean(body.email, 160);
  const config = clean(body.config, 80);
  const purpose = clean(body.purpose, 40);
  const message = String(body.message || '').trim().slice(0, 2000);
  const source = clean(body.source, 40);
  const page = clean(body.page, 300);
  const utm = ['utm_source', 'utm_medium', 'utm_campaign'].map(k => clean(body[k], 80)).filter(Boolean).join(' / ');

  if (!name || !/^[6-9][0-9]{9}$/.test(phone)) return res.status(400).json({ ok: false, error: 'name and 10 digit mobile required' });
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ ok: false, error: 'invalid email' });

  const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
  const rows = [
    ['Name', name], ['Mobile', phone], ['Email', email || 'not given'], ['Interested in', config || 'not given'],
    ['Buying as', purpose || 'not given'], ['Message', message || 'none'], ['Form', source || 'page'],
    ['Page', page || 'https://godrejverano.org/'], ['Campaign', utm || 'direct'], ['Received', when + ' IST']
  ];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const htmlRows = rows.map(([k, v]) => `<tr><td style="padding:6px 10px;border:1px solid #ddd;font-weight:600;background:#f6f1e8">${esc(k)}</td><td style="padding:6px 10px;border:1px solid #ddd">${esc(v)}</td></tr>`).join('');
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#172220"><h2 style="color:#0b3d3a;margin:0 0 12px">New Godrej Verano enquiry</h2><table style="border-collapse:collapse">${htmlRows}</table><p style="margin-top:14px"><a href="https://wa.me/91${phone}">Reply on WhatsApp</a> &middot; <a href="tel:+91${phone}">Call ${phone}</a></p></div>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_PORT || '465') === '465',
    auth: { user, pass }
  });

  try {
    await transporter.sendMail({
      from: `"Godrej Verano Website" <${user}>`,
      to: TO,
      replyTo: email ? `${name} <${email}>` : undefined,
      subject: `Godrej Verano enquiry: ${name} (${config || 'no config'}) ${phone}`,
      text, html
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('mail error', err && err.message);
    return res.status(502).json({ ok: false, error: 'mail send failed' });
  }
};
