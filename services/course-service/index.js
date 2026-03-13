const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8082; 

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

// 2. Add a New Course
app.post('/api/courses', async (req, res) => {
  try {
    const { course_code, course_name, description, credits } = req.body;

    const newCourse = await pool.query(
      `INSERT INTO courses (course_code, course_name, description, credits)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [course_code, course_name, description, credits]
    );

    const course = newCourse.rows[0];

    res.status(201).json({
      id: course.id,
      code: course.course_code,
      name: course.course_name,
      description: course.description,
      credits: course.credits,
      enrolled_count: 0 // New courses always start with 0 enrollments
    });
    
  } catch (err) {
    console.error("Error adding course:", err.message);
    res.status(500).json({ error: "Failed to add course to the database." });
  }
});

// 3. GET ALL COURSES (UPDATED: Only counts 'Active' enrollments)
app.get('/api/courses', async (req, res) => {
  try {
    // We added "AND e.status = 'Active'" to the LEFT JOIN
    const query = `
      SELECT 
        c.id, 
        c.course_code, 
        c.course_name, 
        c.description, 
        c.credits,
        COUNT(e.student_id)::int AS enrolled_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'Active'
      GROUP BY c.id
      ORDER BY c.course_code ASC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching courses:", err.message);
    res.status(500).json({ error: "Failed to retrieve courses." });
  }
});

// 4. Update a Course
app.put('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { course_code, course_name, description, credits } = req.body;

    const updatedCourse = await pool.query(
      `UPDATE courses 
       SET course_code = $1, course_name = $2, description = $3, credits = $4 
       WHERE id = $5 RETURNING *`,
      [course_code, course_name, description, credits, id]
    );

    if (updatedCourse.rows.length === 0) return res.status(404).json({ error: "Course not found." });
    
    res.json(updatedCourse.rows[0]);
  } catch (err) {
    console.error("Error updating course:", err.message);
    res.status(500).json({ error: "Failed to update course." });
  }
});

// 5. Delete a Course
app.delete('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCourse = await pool.query(`DELETE FROM courses WHERE id = $1 RETURNING *`, [id]);

    if (deletedCourse.rows.length === 0) return res.status(404).json({ error: "Course not found." });
    
    res.json({ message: "Course deleted successfully." });
  } catch (err) {
    console.error("Error deleting course:", err.message);
    res.status(500).json({ error: "Failed to delete course." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Course Service is running on http://localhost:${port}`);
});