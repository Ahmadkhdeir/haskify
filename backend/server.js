/* eslint-env node */
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5001;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['POST', 'GET']
}));

app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.deepseek.com/v1",  
  });

app.post('/ai/ask', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
        model: "deepseek-chat",  
        messages: [{ role: "user", content: req.body.query }],
      });
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI-Fehler:", error);
    res.status(500).json({ error: "AI konnte nicht antworten" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});