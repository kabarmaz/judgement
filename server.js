// server.js
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = './results.json';

// Ensure results.json exists
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));

// Save result
app.post('/submit', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  data.push(req.body);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.send({ message: 'Saved' });
});

// Fetch all results
app.get('/results', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  res.send(data);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
