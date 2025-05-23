export default async function handler(req, res) {
  try {
    const url = "http://iras.iub.edu.bd:8079";
    const response = await fetch(url, {
      method: req.method,
      headers: {
        ...req.headers,
        host: "iras.iub.edu.bd",
      },
      body: req.method !== "GET" ? req.body : undefined,
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: "Proxy Failed", details: err.message });
  }
}
