module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  try {
    const apiKey = process.env.POLLINATIONS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Chave da Pollinations não configurada."
      });
    }

    const body = req.body || {};
    const message = body.message || "";
    const messages = body.messages || [];

    if (!message && messages.length === 0) {
      return res.status(400).json({
        error: "Mensagem vazia."
      });
    }

    const response = await fetch(
      "https://gen.pollinations.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-5.4-nano",
          messages: messages.length
            ? messages
            : [{ role: "user", content: message }]
        })
      }
    );

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || "Resposta inválida da Pollinations." };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || data.error || "Erro na Pollinations."
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Erro interno do servidor."
    });
  }
};
