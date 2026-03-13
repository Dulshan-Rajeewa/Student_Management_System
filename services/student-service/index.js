const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- API ROUTES ---

app.get('/api/students/health', (req, res) => {
  res.send('Student Service is up and running on Port 8081!');
});

// 1. NEW: Generate Next Student ID
app.get('/api/students/generate-id', async (req, res) => {
  try {
    const { degree, intake } = req.query;
    if (!degree || !intake) return res.status(400).json({ error: 'Missing parameters' });

    // Calculate year based on your KDU pattern (Intake 41 = 2024 -> Year 24)
    // Formula: Intake - 17 = Year (41 - 17 = 24)
    const year = parseInt(intake) - 17;
    const prefix = `D/${degree}/${year}/`;

    // Find the last registered student in this specific intake and degree
    const result = await pool.query(
      `SELECT student_number FROM students WHERE student_number LIKE $1 ORDER BY student_number DESC LIMIT 1`,
      [`${prefix}%`]
    );

    let nextNumber = 1;
    if (result.rows.length > 0) {
      // Extract the last 4 digits (e.g., "0001" -> 1) and add 1
      const lastId = result.rows[0].student_number;
      const lastDigits = lastId.split('/').pop();
      nextNumber = parseInt(lastDigits) + 1;
    }

    // Pad with zeros to ensure it is 4 digits (e.g., 2 becomes "0002")
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    const generatedId = `${prefix}${formattedNumber}`;

    res.json({ generatedId });
  } catch (err) {
    console.error("Error generating ID:", err.message);
    res.status(500).json({ error: "Failed to generate ID" });
  }
});

// 2. UPDATED: Add Student AND Enrollments (Using SQL Transactions)
app.post('/api/students', async (req, res) => {
  const client = await pool.connect(); // Use a dedicated client for transactions
  try {
    const { student_number, intake_number, first_name, last_name, address, birthday, degree_program, courses } = req.body;

    await client.query('BEGIN'); // Start Transaction

    // Step A: Insert into Students Table
    const newStudent = await client.query(
      `INSERT INTO students (student_number, intake_number, first_name, last_name, address, birthday, degree_program)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, student_number`,
      [student_number, intake_number, first_name, last_name, address, birthday, degree_program]
    );

    const newStudentId = newStudent.rows[0].id;

    // Step B: Insert into Enrollments Table (if courses were provided)
    if (courses && courses.length > 0) {
      for (const courseCode of courses) {
        // Look up the unique course UUID from the DB using the course_code
        const courseRes = await client.query('SELECT id FROM courses WHERE course_code = $1', [courseCode]);
        
        if (courseRes.rows.length > 0) {
          const courseId = courseRes.rows[0].id;
          // Enroll the student in Semester 1
          await client.query(
            `INSERT INTO enrollments (student_id, course_id, semester) VALUES ($1, $2, $3)`,
            [newStudentId, courseId, 1]
          );
        }
      }
    }

    await client.query('COMMIT'); // Save all changes
    res.status(201).json(newStudent.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK'); // If anything fails, undo the whole transaction!
    console.error("Error adding student:", err.message);
    res.status(500).json({ error: "Failed to add student to the database." });
  } finally {
    client.release();
  }
});

// 3. Get All Students
app.get('/api/students', async (req, res) => {
  try {
    const allStudents = await pool.query('SELECT * FROM students ORDER BY registration_date DESC');
    res.json(allStudents.rows);
  } catch (err) {
    console.error("Error fetching students:", err.message);
    res.status(500).json({ error: "Failed to retrieve students." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Student Service is running on http://localhost:${port}`);
});