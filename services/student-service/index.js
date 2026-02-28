const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // This is the PostgreSQL driver
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8081;

// --- MIDDLEWARE ---
// This allows your React frontend to communicate with this backend without security blocks
app.use(cors()); 
// This allows your server to read JSON data sent from the frontend
app.use(express.json()); 

// --- DATABASE CONNECTION ---
// This uses the DATABASE_URL from your .env file to talk to Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for cloud databases like Supabase
});

// --- API ROUTES (The "Endpoints") ---

// 1. Health Check Route (Just to see if the server is awake)
app.get('/api/students/health', (req, res) => {
  res.send('Student Service is up and running on Port 8081!');
});

// 2. Add a New Student (POST request)
app.post('/api/students', async (req, res) => {
  try {
    // Extract the data sent from the frontend
    const { student_number, intake_number, first_name, last_name, address, birthday, degree_program } = req.body;

    // Insert into Supabase securely using parameterized queries ($1, $2...) to prevent hacking
    const newStudent = await pool.query(
      `INSERT INTO students (student_number, intake_number, first_name, last_name, address, birthday, degree_program)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [student_number, intake_number, first_name, last_name, address, birthday, degree_program]
    );

    // Send the newly created student back as a success response
    res.status(201).json(newStudent.rows[0]);
  } catch (err) {
    console.error("Error adding student:", err.message);
    res.status(500).json({ error: "Failed to add student to the database." });
  }
});

// 3. Get All Students (GET request)
app.get('/api/students', async (req, res) => {
  try {
    // Fetch everyone from the database, newest first
    const allStudents = await pool.query('SELECT * FROM students ORDER BY registration_date DESC');
    res.json(allStudents.rows);
  } catch (err) {
    console.error("Error fetching students:", err.message);
    res.status(500).json({ error: "Failed to retrieve students." });
  }
});

// --- START THE SERVER ---
app.listen(port, () => {
  console.log(`🚀 Student Service is running on http://localhost:${port}`);
});