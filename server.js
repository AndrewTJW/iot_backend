import express from 'express';

import { fetchAndStoreISS, fetchLatest } from './fetch-iss.js';


const app = express();
const port = 3000;


app.use(express.static('public')); // Serve static files

app.get('/', (req, res) => {
  res.send("Express server Running!")
})

let running = false;
setInterval(async () => {
  if (running) return;
  running = true;
  try { 
    const {data, change} = await fetchAndStoreISS(); 
    console.log(`Data: ${data}`)
    console.log(`Change: ${change}`)
  } catch (err) {
    console.log(`Error: ${err}`)
  } finally { 
    running = false; 
  }
}, 1000); // Schedule every 10 seconds (respects ~1/sec rate limit; adjust for production) //andrew changed the scheduling to run every 1 second, and log for debugging purposes


app.get('/latestdata', async (req, res) => {
  try {
    const {last_row} = await fetchLatest();
    res.json({last_row}); // Send newest location data & change to frontend
  } catch (err) {
    console.log(err)
  }
});

app.listen(port, () => console.log(`Server on http://localhost:${port}`));