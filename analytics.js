require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function computeAnalytics() {
  try {
    // Compute max and min longitude
    const [lonRows] = await pool.query('SELECT MAX(longitude) as max_lon, MIN(longitude) as min_lon FROM iss_telemetry');
    console.log('Max Longitude:', lonRows[0].max_lon);
    console.log('Min Longitude:', lonRows[0].min_lon);

    // Compute altitude changes (difference from previous entry)
    const [altRows] = await pool.query(`
      SELECT altitude, LAG(altitude) OVER (ORDER BY timestamp) as prev_alt 
      FROM iss_telemetry
    `);
    const changes = altRows.map(row => {
      if (row.prev_alt !== null) return row.altitude - row.prev_alt;
      return null;
    }).filter(change => change !== null);
    console.log('Altitude Changes:', changes);

  } catch (error) {
    console.error('Error computing analytics:', error.message);
  } finally {
    await pool.end(); // Close the pool
  }
}

computeAnalytics();