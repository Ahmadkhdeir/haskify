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

// Security middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['POST', 'GET']
}));

app.use(express.json());

// Rate limiting for execution endpoint
const executionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { output: "Too many requests, please try again later" }
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.deepseek.com/v1",  
});

// AI Assistant Endpoint (existing)
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

// Haskell Execution Endpoint (new)
app.post('/run-haskell', executionLimiter, async (req, res) => {
  try {
    // Input validation
    if (!req.body.code || typeof req.body.code !== 'string' || req.body.code.length > 10000) {
      return res.status(400).json({ output: "Invalid code: Must be <10KB" });
    }

    // Sanitize code (basic check for dangerous commands)
    if (req.body.code.includes('System.IO.Unsafe') || 
        req.body.code.includes('unsafePerformIO')) {
      return res.status(400).json({ output: "Unsafe operations not allowed" });
    }

    // Write to temporary file
    const tempFile = `/tmp/haskell-${Date.now()}.hs`;
    fs.writeFileSync(tempFile, req.body.code);

    // Execute with timeout (5 seconds)
    const { stdout, stderr } = await execPromise(
      `timeout 5s ghc ${tempFile} -o ${tempFile}.out && ${tempFile}.out`,
      { maxBuffer: 1024 * 1024 } // 1MB output limit
    );

    // Cleanup
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

// Health check
app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});