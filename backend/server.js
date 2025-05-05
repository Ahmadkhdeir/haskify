import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 5000;

app.use(cors()); 
app.use(express.json()); 

app.post('/ai/ask', (req, res) => {
  const userQuery = req.body.query;
  console.log("User fragt:", userQuery);

  const aiResponse = `Antwort auf: "${userQuery}" (Mock)`;

  res.json({ response: aiResponse });
});

app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});