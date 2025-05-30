/* eslint-env node */
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';

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

const exampleConversations = [
  {
    role: "system",
    content: "Example 1 - Concise Monad Explanation:\nUser: \"What's a monad?\"\nAssistant: \"A monad is a type class for handling effects. Example:\n\n```haskell\nsafeDivide :: Double -> Double -> Maybe Double\nsafeDivide _ 0 = Nothing\nsafeDivide x y = Just (x / y)\n\nresult = do\n    x <- safeDivide 10 2\n    y <- safeDivide x 2\n    return y\n```\n\nHandles computations that might fail, like division by zero.\""
  },
  {
    role: "system",
    content: "Example 2 - Type Signatures:\nUser: \"Why use type signatures?\"\nAssistant: \"Type signatures provide:\n1. Documentation\n2. Type safety\n3. Better error messages\n\nExample:\n```haskell\nadd :: Num a => a -> a -> a\nadd x y = x + y\n```\n\nCatches type errors at compile time.\""
  },
  {
    role: "system",
    content: "Example 3 - Pattern Matching:\nUser: \"How to use pattern matching?\"\nAssistant: \"Pattern matching deconstructs data:\n\n```haskell\nsumList :: [Int] -> Int\nsumList [] = 0\nsumList (x:xs) = x + sumList xs\n\ndata Shape = Circle Double | Rectangle Double Double\narea (Circle r) = pi * r * r\narea (Rectangle w h) = w * h\n```\n\nCleaner than if-then-else.\""
  }
];

app.post('/ai/ask', async (req, res) => {
  try {
    const { query, code, output } = req.body;
    
    const systemMessage = `You are a concise Haskell and functional programming expert. Keep responses:
1. Short and to the point
2. Clear and direct
3. No repetition
4. Focus on key concepts
5. Use minimal but effective examples

The user's current code is:
\`\`\`haskell
${code}
\`\`\`
${output ? `The last execution output was:
\`\`\`
${output}
\`\`\`` : ''}

When suggesting code changes:
1. Include only necessary code
2. Keep comments minimal but clear
3. Focus on the specific issue
4. No redundant explanations
5. Format code blocks properly

Provide direct, accurate responses about Haskell programming. 
If there are errors, explain them briefly.
Format code blocks with proper syntax highlighting.`;

    const stream = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemMessage },
        ...exampleConversations,
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
  console.log('Received Haskell code execution request');
  try {
    if (!req.body.code || typeof req.body.code !== 'string' || req.body.code.length > 10000) {
      console.log('Invalid code received');
      return res.status(400).json({ output: "Invalid code: Must be <10KB" });
    }

    if (req.body.code.includes('System.IO.Unsafe') || 
        req.body.code.includes('unsafePerformIO')) {
      console.log('Unsafe operations detected');
      return res.status(400).json({ output: "Unsafe operations not allowed" });
    }

    const tempFile = `/tmp/haskell-${Date.now()}.hs`;
    console.log('Writing code to temporary file:', tempFile);
    fs.writeFileSync(tempFile, req.body.code);

    // First compile the code
    try {
      console.log('Starting compilation...');
      const { stderr: compileError } = await execPromise(
        `ghc ${tempFile} -o ${tempFile}.out`,
        { maxBuffer: 1024 * 1024 }
      );
      
      if (compileError) {
        console.log('Compilation error:', compileError);
        return res.status(400).json({ output: compileError });
      }
      console.log('Compilation successful');
    } catch (compileError) {
      console.log('Compilation failed:', compileError);
      return res.status(400).json({ 
        output: compileError.stderr || "Compilation failed" 
      });
    }

    // Then run the compiled program with a longer timeout
    try {
      console.log('Starting program execution...');
      const { stdout, stderr } = await execPromise(
        `timeout 10s ${tempFile}.out`,
        { maxBuffer: 1024 * 1024 }
      );

      console.log('Program execution completed');
      // Clean up
      fs.unlinkSync(tempFile);
      if (fs.existsSync(`${tempFile}.out`)) fs.unlinkSync(`${tempFile}.out`);
      if (fs.existsSync(`${tempFile}.hi`)) fs.unlinkSync(`${tempFile}.hi`);
      if (fs.existsSync(`${tempFile}.o`)) fs.unlinkSync(`${tempFile}.o`);

      res.json({ 
        output: stdout || stderr || "> Program executed (no output)" 
      });
    } catch (runError) {
      console.log('Program execution failed:', runError);
      // Clean up even if execution fails
      fs.unlinkSync(tempFile);
      if (fs.existsSync(`${tempFile}.out`)) fs.unlinkSync(`${tempFile}.out`);
      if (fs.existsSync(`${tempFile}.hi`)) fs.unlinkSync(`${tempFile}.hi`);
      if (fs.existsSync(`${tempFile}.o`)) fs.unlinkSync(`${tempFile}.o`);

      res.status(500).json({ 
        output: runError.stderr || "Execution timed out or crashed" 
      });
    }
  } catch (error) {
    console.log('Unexpected error:', error);
    res.status(500).json({ 
      output: error.stderr || "An unexpected error occurred" 
    });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'my_gmail@gmail.com',    
      pass: 'my_gmail_app_password',  
    },
  });

  try {
    await transporter.sendMail({
      from: email,
      to: 'xx@yy.com', // TODO: my destination email
      subject: `Contact Form Submission from ${name}`,
      text: message,
      replyTo: email,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});