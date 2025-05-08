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
      const stream = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: req.body.query }],
        stream: true,
      });
  
      res.setHeader('Content-Type', 'text/plain'); 
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
  
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        res.write(content); 
        if (typeof res.flush === 'function') res.flush();
      }
  
      res.end();
    } catch (error) {
      console.error("OpenAI Error:", error);
      res.status(500).send("⚠️ AI couldn't respond");
    }
  });

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});