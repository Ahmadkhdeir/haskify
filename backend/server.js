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
import mongoose from 'mongoose';

dotenv.config();
const execPromise = util.promisify(exec);
const app = express();
const PORT = 5001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH'],
  credentials: false
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
    content: "Example 1:\nUser: \"I'm stuck with monads\"\nAssistant: \"Try this:\n```haskell\nsafeDivide :: Double -> Double -> Maybe Double\nsafeDivide _ 0 = Nothing\nsafeDivide x y = ?\n```\nWhat happens when chaining?\""
  },
  {
    role: "system",
    content: "Example 2:\nUser: \"My code has type errors\"\nAssistant: \"Run `:t functionName` in GHCi. Check type signatures.\""
  },
  {
    role: "system",
    content: "Example 3:\nUser: \"Write a reverse function\"\nAssistant: \"```haskell\nreverse :: [a] -> [a]\nreverse [] = ?\nreverse (x:xs) = ?\n```\nHow combine head with reversed tail?\""
  }
];

app.post('/ai/ask', async (req, res) => {
  try {
    const { query, code, output } = req.body;
    
    const simpleTestMessages = [
      'test', 'hello', 'hi', 'hey', 'ok', 'yes', 'no', 'cool', 'nice', 'just testing',
      'im just testing', 'i am just testing', 'just test', 'test test', 'hello there', 'hi there'
    ];
    
    const queryLower = query.toLowerCase().trim();
    
    const isSimpleTest = simpleTestMessages.some(msg => 
      queryLower === msg.toLowerCase() || 
      (queryLower.includes(msg.toLowerCase()) && queryLower.length < 20)
    );
    
    if (isSimpleTest) {
      return res.json({ response: "Hi! I'm ready to help with Haskell questions." });
    }
    
    const haskellKeywords = [
      'haskell', 'monad', 'functor', 'applicative', 'type', 'function', 'pattern', 'matching',
      'recursion', 'fold', 'map', 'filter', 'list', 'maybe', 'either', 'io', 'pure', 'bind',
      'do notation', 'guard', 'where', 'let', 'in', 'data', 'newtype', 'class', 'instance',
      'ghc', 'ghci', 'compile', 'error', 'type signature', 'lambda', 'curry', 'partial',
      'lazy', 'evaluation', 'strict', 'tail', 'recursion', 'higher', 'order', 'function'
    ];
    
    const haskellCodePatterns = [
      /::/, /->/, /=>/, /<-/, /do/, /where/, /let/, /in/, /data/, /newtype/, /class/, /instance/,
      /Maybe/, /Either/, /IO/, /Just/, /Nothing/, /Left/, /Right/, /putStrLn/, /return/,
      /map/, /filter/, /fold/, /zip/, /unzip/, /head/, /tail/, /init/, /last/, /length/,
      /reverse/, /sort/, /take/, /drop/, /concat/, /concatMap/, /and/, /or/, /any/, /all/
    ];
    
    // Much stricter detection - must have explicit Haskell content
    const hasExplicitHaskellContent = haskellKeywords.some(keyword => 
      queryLower.includes(keyword.toLowerCase())
    ) || haskellCodePatterns.some(pattern => 
      pattern.test(query)
    );
    
    // Allow clear questions OR requests for code
    const isClearQuestion = query.includes('?') && (
      query.includes('how') || query.includes('what') || query.includes('why') || 
      query.includes('when') || query.includes('where') || query.includes('which')
    );
    
    // Also allow requests for code (like "give me code", "show me code", etc.)
    const isCodeRequest = queryLower.includes('code') || 
                         queryLower.includes('give') || 
                         queryLower.includes('show') || 
                         queryLower.includes('write') ||
                         queryLower.includes('create') ||
                         queryLower.includes('make');
    
    const isHaskellQuestion = hasExplicitHaskellContent || isClearQuestion || isCodeRequest;
    
    if (!isHaskellQuestion) {
      return res.json({ response: "I'm here to help with Haskell and functional programming! What would you like to learn about?" });
    }
    
    const systemMessage = `You are a concise Haskell tutor. MAXIMUM 50 words per response.

RULES:
1. ONLY Haskell questions
2. NO complete solutions - only hints
3. MAX 50 words total
4. Use ? placeholders
5. One short code example max

Current code:
\`\`\`haskell
${code}
\`\`\`
${output ? `Output: \`\`\`${output}\`\`\`` : ''}

Keep it short. Hints only.`;

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

    try {
      console.log('Starting program execution...');
      const { stdout, stderr } = await execPromise(
        `echo "${req.body.input || ''}" | timeout 10s ${tempFile}.out`,
        { maxBuffer: 1024 * 1024 }
      );

      res.json({ 
        output: stdout || stderr || "> Program executed (no output)" 
      });
    } catch (runError) {
      console.log('Program execution failed:', runError);
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

app.post('/api/save-session', async (req, res) => {
  try {
    const { session } = req.body; 
    if (!Array.isArray(session) || session.length === 0) {
      return res.status(400).json({ success: false, error: 'Session data required' });
    }
    const saved = await Session.create({ session });
    res.json({ success: true, id: saved._id });
  } catch (err) {
    console.error('Save session error:', err);
    res.status(500).json({ success: false, error: 'Failed to save session' });
  }
});

app.patch('/api/save-session/:id', async (req, res) => {
  try {
    const { session } = req.body;
    const { id } = req.params;
    if (!Array.isArray(session) || session.length === 0) {
      return res.status(400).json({ success: false, error: 'Session data required' });
    }
    const updated = await Session.findByIdAndUpdate(
      id,
      { session },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Update session error:', err);
    res.status(500).json({ success: false, error: 'Failed to update session' });
  }
});

app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('No MONGODB_URI found in .env, MongoDB not connected');
}

const sessionSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  session: [
    {
      question: String,
      response: String,
      time: { type: Date, default: Date.now }
    }
  ]
});
const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);