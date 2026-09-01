const defaultModel = "gemini-3.6-flash";
const allowedModels = new Set([defaultModel, "gemini-3.7-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]);

async function generateGemini(body, apiKey) {
  if (!apiKey) return { status: 500, body: { error: "Missing GEMINI_API_KEY" } };

  const model = allowedModels.has(body.model) ? body.model : defaultModel;
  const prompt = String(body.prompt || "").trim();
  if (!prompt) return { status: 400, body: { error: "Prompt is required" } };

  const parts = [{ text: prompt }];
  if (body.image?.data) {
    const mimeType = String(body.image.mimeType || "image/jpeg");
    if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) return { status: 400, body: { error: "Unsupported image type" } };
    parts.push({ inlineData: { mimeType, data: String(body.image.data) } });
  }

  let response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.55, maxOutputTokens: 900 },
      }),
    });
  } catch (error) {
    return { status: 502, body: { error: `Could not reach Gemini API: ${error.message}` } };
  }

  const data = await readResponseBody(response);
  if (!response.ok) return { status: response.status, body: { error: data?.error?.message || "Gemini request failed" } };

  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  return { status: 200, body: { text } };
}

async function readResponseBody(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: { message: text } };
  }
}

module.exports = { generateGemini };
