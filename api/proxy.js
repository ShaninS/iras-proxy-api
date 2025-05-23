const https = require('https');

module.exports = async (req, res) => {
  // 1. টার্গেট IRAS বেস URL (ডাবল স্ল্যাশ সহ)
  const IRAS_BASE_URL = 'https://iras.iub.edu.bd:8079/'; // নোট: শেষে স্ল্যাশ

  // 2. রিকুয়েস্ট পাথ প্রসেসিং
  let path = req.url.replace('/api/proxy', '');
  
  // 3. ডাবল স্ল্যাশ ফোর্স করুন (যদি ইতিমধ্যে না থাকে)
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  path = path.replace(/^\//, '//'); // সিঙ্গেল স্ল্যাশ → ডাবল স্ল্যাশ

  // 4. ফাইনাল URL
  const targetUrl = `${IRAS_BASE_URL}${path}`.replace(/([^:]\/)\/+/g, '$1'); // ট্রিপল স্ল্যাশ এভয়েড

  console.log('Proxying to:', targetUrl); // ডিবাগ লগ

  // 5. HTTPS রিকুয়েস্ট
  const options = {
    method: req.method,
    headers: {
      ...req.headers,
      host: 'iras.iub.edu.bd',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': 'https://irasv1.iub.edu.bd/'
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

  // বডি ডাটা সেন্ড (POST/PUT/PATCH)
  if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    proxyReq.write(JSON.stringify(req.body));
  }

  proxyReq.end();
};
