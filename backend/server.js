import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001;

app.use(cors({
  origin: 'http://localhost:5173',  
  methods: ['POST', 'GET']         
}));

app.use(express.json());

app.post('/ai/ask', (req, res) => {
  console.log("Empfangene Anfrage:", req.body.query);
  res.json({ response: `Antwort auf: "${req.body.query}"` });
});

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});