import type { NextApiRequest, NextApiResponse } from 'next'
import https from 'https'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const IRAS_BASE_URL = 'https://iras.iub.edu.bd:8079/'

  // Remove /api/proxy from path and replace single slash with double slash
  let path = req.url?.replace(/^\/api\/proxy/, '') || '/'
  path = path.startsWith('/') ? '/' + path : path
  path = path.replace(/^\//, '//') // force double slash

  const targetUrl = `${IRAS_BASE_URL}${path}`.replace(/([^:]\/)\/+/g, '$1') // avoid triple slashes

  const options = {
    method: req.method,
    headers: {
      ...req.headers,
      host: 'iras.iub.edu.bd',
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Referer: 'https://irasv1.iub.edu.bd/',
    },
    rejectUnauthorized: false,
  }

  const proxyReq = https.request(targetUrl, options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers)
    proxyRes.pipe(res, { end: true })
  })

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err)
    res.status(502).json({ error: 'Bad Gateway', details: err.message })
  })

  // Pipe the original request body
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq)
  } else {
    proxyReq.end()
  }
}
