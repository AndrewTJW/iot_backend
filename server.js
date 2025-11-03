require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 3000;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(express.static('public')); // Serve static files

app.get('/data', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM iss_telemetry ORDER BY timestamp DESC LIMIT 100');
  res.json(rows); // Send latest 100 points for map
});

app.listen(port, () => console.log(`Server on http://localhost:${port}`));