// Vercel Serverless Function — Send email via Resend API
// Called by email-notify.js from the frontend

// ── Simple in-memory rate limiter (per Vercel instance) ──
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;       // max 5 emails per minute per IP

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) return true;
  return false;
}

// ── Allowed origins ──
const ALLOWED_ORIGINS = [
  'https://expert-erp.vercel.app',
  'https://www.expert-erp.vercel.app',
];

function getAllowedOrigin(req) {
  const origin = req.headers?.origin || '';
  // Allow localhost in development
  if (origin.startsWith('http://localhost')) return origin;
  // Allow Vercel preview deployments
  if (origin.endsWith('.vercel.app')) return origin;
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return null;
}

// ── Email validation ──
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export default async function handler(req, res) {
  // CORS headers — restrict to allowed origins
  const allowedOrigin = getAllowedOrigin(req);
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Rate limiting ──
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  // ── Origin check (block requests from unknown origins) ──
  if (!allowedOrigin) {
    return res.status(403).json({ error: 'Forbidden: invalid origin' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error('[send-email] RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  try {
    const { to, subject, html } = req.body;

    // ── Input validation ──
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    if (!isValidEmail(to)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (subject.length > 500) {
      return res.status(400).json({ error: 'Subject too long (max 500 chars)' });
    }

    if (html.length > 50000) {
      return res.status(400).json({ error: 'Email body too long (max 50KB)' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'ExpertERP <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[send-email] Resend error:', data.message || 'Unknown error');
      return res.status(response.status).json({ error: 'Email send failed' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('[send-email] Server error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
