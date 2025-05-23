export default async function handler(req, res) {
  try {
    // This ensures the full path, including double slashes, is preserved
    const url = "http://iras.iub.edu.bd:8079" + req.url;

    const response = await fetch(url, {
      method: req.method,
      headers: {
        ...req.headers,
        host: "iras.iub.edu.bd",
      },
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      redirect: "follow"
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: "Proxy Failed", details: err.message });
  }
}
