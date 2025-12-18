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
  return JSON.parse(fs.readFileSync(MEMORY_FILE));
}

function saveMemory(data) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
}

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  let memory = loadMemory();

  const found = memory.find(
    (m) => m.question.toLowerCase() === userMessage.toLowerCase()
  );

  if (found) {
    return res.json({ reply: found.answer + " (from memory)" });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: userMessage }],
  });

  const reply = completion.choices[0].message.content;

  memory.push({ question: userMessage, answer: reply });
  saveMemory(memory);

  res.json({ reply });
});

app.listen(3000, () => {
  console.log("Backend running on port 3000");
});
