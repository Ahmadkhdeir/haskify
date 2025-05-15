/* eslint-env node */
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

dotenv.config();
const execPromise = util.promisify(exec);
const app = express();
const PORT = 5001;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['POST', 'GET']
}));

app.use(express.json());

const executionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: { output: "Too many requests, please try again later" }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.deepseek.com/v1",  
});

app.post('/ai/ask', async (req, res) => {
  try {
    const { query, code, output } = req.body;
    
    // Create a system message that includes context about the code
    const systemMessage = `You are a Haskell programming assistant. 
    The user's current code is:
    \`\`\`haskell
    ${code}
    \`\`\`
    ${output ? `The last execution output was:
    \`\`\`
    ${output}
    \`\`\`` : ''}
    
    Provide helpful, accurate responses about Haskell programming. 
    If the user asks about their code, analyze it and suggest improvements.
    If there are errors, explain them clearly.
    Always format code blocks with proper syntax highlighting.`;

    const stream = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: query }
      ],
      stream: true,
    });

    let responseText = '';
    for await (const chunk of stream) {
      responseText += chunk.choices[0]?.delta?.content || '';
    }

    res.json({ response: responseText });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ response: "⚠️ AI couldn't respond" });
  }
});

app.post('/run-haskell', executionLimiter, async (req, res) => {
  try {
    if (!req.body.code || typeof req.body.code !== 'string' || req.body.code.length > 10000) {
      return res.status(400).json({ output: "Invalid code: Must be <10KB" });
    }

    if (req.body.code.includes('System.IO.Unsafe') || 
        req.body.code.includes('unsafePerformIO')) {
      return res.status(400).json({ output: "Unsafe operations not allowed" });
    }

    const tempFile = `/tmp/haskell-${Date.now()}.hs`;
    fs.writeFileSync(tempFile, req.body.code);

    const { stdout, stderr } = await execPromise(
      `timeout 5s ghc ${tempFile} -o ${tempFile}.out && ${tempFile}.out`,
      { maxBuffer: 1024 * 1024 } 
    );

    fs.unlinkSync(tempFile);
    if (fs.existsSync(`${tempFile}.out`)) fs.unlinkSync(`${tempFile}.out`);

    res.json({ 
      output: stdout || stderr || "> Program executed (no output)" 
    });
  } catch (error) {
    res.status(500).json({ 
      output: error.stderr || "Execution timed out or crashed" 
    });
  }
});

app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});