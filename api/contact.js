module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    return response.status(405).json({ ok: false });
  }

  const origin = request.headers.origin;
  if (origin && origin !== 'https://morika-lp.vercel.app') {
    return response.status(403).json({ ok: false });
  }

  const body = request.body && typeof request.body === 'object' ? request.body : {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const recipient = process.env.CONTACT_EMAIL;

  if (!recipient) {
    return response.status(503).json({ ok: false });
  }

  if (!name || name.length > 120 || !email || email.length > 320 || !message || message.length > 4000) {
    return response.status(400).json({ ok: false });
  }

  try {
    const formResponse = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        message,
        _replyto: email,
        _subject: '杜花サイトからのお問い合わせ'
      })
    });

    if (!formResponse.ok) {
      return response.status(502).json({ ok: false });
    }

    return response.status(200).json({ ok: true });
  } catch {
    return response.status(502).json({ ok: false });
  }
};
