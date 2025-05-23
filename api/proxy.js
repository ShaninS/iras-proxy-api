export default async function handler(req, res) {
  try {
    const targetURL = `http://iras.iub.edu.bd:8079${req.url.replace("/api/proxy", "")}`;
    const response = await fetch(targetURL, {
      method: req.method,
      headers: {
        ...req.headers,
        host: "iras.iub.edu.bd",
      },
      body: req.method !== "GET" ? req.body : undefined,
    });

    const contentType = response.headers.get("content-type") || "text/plain";
    res.setHeader("Content-Type", contentType);
    res.status(response.status).send(await response.text());
  } catch (err) {
    res.status(500).json({ error: "Proxy Failed", details: err.message });
  }
}
