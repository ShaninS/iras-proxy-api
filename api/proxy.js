const https = require('https');

module.exports = (req, res) => {
  const IRAS_BASE_URL = 'https://iras.iub.edu.bd:8079';

  // Fix: remove only leading /api to avoid double slashes
  let path = req.url.replace(/^\/api/, ''); 
  const targetUrl = IRAS_BASE_URL + path;

  const options = {
    method: req.method,
    headers: {
      ...req.headers,
      host: 'iras.iub.edu.bd',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': 'https://irasv1.iub.edu.bd/',
    },
    rejectUnauthorized: false
  };

  const proxyReq = https.request(targetUrl, options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (error) => {
    console.error('Proxy error:', error);
    res.status(502).json({ error: 'Bad Gateway' });
  });

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      proxyReq.write(body);
      proxyReq.end();
    });
  } else {
    proxyReq.end();
  }
};
