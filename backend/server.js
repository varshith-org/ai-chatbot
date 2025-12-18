const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const OpenAI = require("openai");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MEMORY_FILE = "memory.json";

function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) return [];
  return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
}

function saveMemory(data) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
}

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.json({ reply: "Empty message received" });
    }

    let memory = loadMemory();

    const found = memory.find(
      (m) => m.question.toLowerCase() === userMessage.toLowerCase()
    );

    if (found) {
      return res.json({ reply: found.answer + " (from memory)" });
    }

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: userMessage,
    });

    const reply =
      completion.output?.[0]?.content?.[0]?.text ??
      "No reply from model";

    memory.push({ question: userMessage, answer: reply });
    saveMemory(memory);

    res.json({ reply });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.status(500).json({ reply: "Backend error" });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
