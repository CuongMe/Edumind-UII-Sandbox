const { generateGemini } = require("./gemini-core");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const result = await generateGemini(req.body || {}, process.env.GEMINI_API_KEY);
  return res.status(result.status).json(result.body);
};
