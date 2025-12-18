const express = require("express");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();

/* ✅ SAFE CORS (Render + Netlify compatible) */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

/* ✅ OpenAI client */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ✅ Chat route */
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ reply: "No message provided" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("OPENAI ERROR:", error);
    res.status(500).json({ reply: "Backend error" });
  }
});

/* ✅ REQUIRED for Render */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
