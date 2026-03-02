const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8083; // Audit Service runs on 8083

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- API ROUTES ---

// 1. Health Check Route
app.get('/api/audit/health', (req, res) => {
  res.send('Audit Service is up and running on Port 8083!');
});

// 2. Log a New Activity (POST request)
app.post('/api/audit', async (req, res) => {
  try {
    const { admin_id, action_type, entity_type, entity_id, details } = req.body;

    const newLog = await pool.query(
      `INSERT INTO audit_logs (admin_id, action_type, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [admin_id, action_type, entity_type, entity_id, details]
    );

    res.status(201).json(newLog.rows[0]);
  } catch (err) {
    console.error("Error creating audit log:", err.message);
    res.status(500).json({ error: "Failed to log activity." });
  }
});

// 3. Get All Audit Logs (GET request)
app.get('/api/audit', async (req, res) => {
  try {
    // Fetch logs, ordering by the newest first
    const allLogs = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    res.json(allLogs.rows);
  } catch (err) {
    console.error("Error fetching audit logs:", err.message);
    res.status(500).json({ error: "Failed to retrieve audit logs." });
  }
});

// --- START THE SERVER ---
app.listen(port, () => {
  console.log(`🚀 Audit Service is running on http://localhost:${port}`);
});