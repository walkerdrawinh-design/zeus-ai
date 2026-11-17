export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });
  const key = process.env.POLLINATIONS_API_KEY;
  if (!key) return res.status(500).json({ error: 'Configure POLLINATIONS_API_KEY nas variáveis da Vercel.' });
  try {
    const { messages = [] } = req.body || {};
    if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: 'Envie uma mensagem.' });
    const upstream = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'openai/gpt-5.4-nano', messages, stream: false })
    });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json({ error: data?.error?.message || data?.message || 'Falha no serviço de IA.' });
    return res.status(200).json({ text: data.choices?.[0]?.message?.content || 'Não consegui gerar uma resposta.' });
  } catch (e) { return res.status(500).json({ error: 'Erro ao conectar com a inteligência artificial.' }); }
}
