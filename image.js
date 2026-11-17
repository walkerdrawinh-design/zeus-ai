export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  const key = process.env.POLLINATIONS_API_KEY;
  if (!key) return res.status(500).json({ error: 'Configure POLLINATIONS_API_KEY nas variáveis da Vercel.' });
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || prompt.length > 1200) return res.status(400).json({ error: 'Descreva a imagem (até 1.200 caracteres).' });
    const url = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024&nologo=true`;
    const upstream = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    if (!upstream.ok) {
      const detail = await upstream.text();
      return res.status(upstream.status).json({ error: detail.slice(0, 300) || 'Não foi possível gerar a imagem.' });
    }
    const image = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(image);
  } catch (e) { return res.status(500).json({ error: 'Erro ao gerar a imagem.' }); }
}
