import axios from 'axios';
import pool from './database.js'; //the connection pool created to establishj individual connection

const satellite_id = "25544"
const API_URL = `https://api.wheretheiss.at/v1/satellites/${satellite_id}`;


async function fetchAndStoreISS() {
  try {
    const response = await axios.get(API_URL);
    const data = response.data;
    const [result] = await pool.query(
      'INSERT INTO iss_telemetry (latitude, longitude, altitude, velocity, timestamp) VALUES (?, ?, ?, ?, ?)',
      [data.latitude, data.longitude, data.altitude, data.velocity, data.timestamp]
    );
    console.log('Data inserted:', data.timestamp);
    console.log(result.insertId)
    console.log(JSON.stringify(data))
    // Bonus: Check altitude change (compare with last entry)
    const [lastRows] = await pool.query('SELECT altitude FROM iss_telemetry ORDER BY id DESC LIMIT 1 OFFSET 1');
    let change = null;
    if (lastRows.length > 0) {
      change = data.altitude - lastRows[0].altitude;
      if (Math.abs(change) > 0.1) console.log('Altitude change detected:', change); // Log for bonus
    }
    return {data, change} //returns an object for use later
  } catch (err) {
    console.error('Error fetching/storing:', err);
    return err
  }
}

async function fetchLatest() {
  try {
    const sql = 'SELECT * FROM iss_telemetry ORDER BY id DESC LIMIT 1'
    const [arr_last_row] = await pool.query(sql) //destructure the returned array that contains an object which is the last row of data
    const last_row = arr_last_row[0] //get the first object which contains the last row data in the form of type <object>
    console.log(`Last row data: ${JSON.stringify(last_row)}`)
    return {last_row}
  } catch (err) {
    console.log(`Error: ${err}`)
  }
}




export { fetchAndStoreISS, fetchLatest };