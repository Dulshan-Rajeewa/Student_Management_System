const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8082; // Course Service runs on 8082 

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
app.get('/api/courses/health', (req, res) => {
  res.send('Course Service is up and running on Port 8082!');
});

// 2. Add a New Course (POST request)
app.post('/api/courses', async (req, res) => {
  try {
    const { course_code, course_name, description, credits } = req.body;

    const newCourse = await pool.query(
      `INSERT INTO courses (course_code, course_name, description, credits)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [course_code, course_name, description, credits]
    );

    res.status(201).json(newCourse.rows[0]);
  } catch (err) {
    console.error("Error adding course:", err.message);
    res.status(500).json({ error: "Failed to add course to the database." });
  }
});

// 3. Get All Courses (GET request)
app.get('/api/courses', async (req, res) => {
  try {
    const allCourses = await pool.query('SELECT * FROM courses ORDER BY course_code ASC');
    res.json(allCourses.rows);
  } catch (err) {
    console.error("Error fetching courses:", err.message);
    res.status(500).json({ error: "Failed to retrieve courses." });
  }
});

// --- START THE SERVER ---
app.listen(port, () => {
  console.log(`🚀 Course Service is running on http://localhost:${port}`);
});