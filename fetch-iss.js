require('dotenv').config();
const axios = require('axios');
const mysql = require('mysql2/promise');
const cron = require('node-cron');

const API_URL = 'https://api.wheretheiss.at/v1/satellites/25544';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function fetchAndStoreISS() {
  try {
    const response = await axios.get(API_URL);
    const data = response.data;
    const [rows] = await pool.query(
      'INSERT INTO iss_telemetry (latitude, longitude, altitude, velocity, timestamp) VALUES (?, ?, ?, ?, ?)',
      [data.latitude, data.longitude, data.altitude, data.velocity, data.timestamp]
    );
    console.log('Data inserted:', data.timestamp);
    // Bonus: Check altitude change (compare with last entry)
    const [lastRows] = await pool.query('SELECT altitude FROM iss_telemetry ORDER BY id DESC LIMIT 1 OFFSET 1');
    if (lastRows.length > 0) {
      const change = data.altitude - lastRows[0].altitude;
      if (Math.abs(change) > 0.1) console.log('Altitude change detected:', change); // Log for bonus
    }
  } catch (error) {
    console.error('Error fetching/storing:', error.message);
  }
}

// Schedule every 10 seconds (respects ~1/sec rate limit; adjust for production)
cron.schedule('*/10 * * * * *', fetchAndStoreISS);

console.log('Fetcher running...');