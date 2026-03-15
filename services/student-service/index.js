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

app.get('/api/students/health', (req, res) => res.send('Student Service up!'));

// 1. Generate Next Student ID
app.get('/api/students/generate-id', async (req, res) => {
  try {
    const { degree, intake } = req.query;
    const year = parseInt(intake) - 17;
    const prefix = `D/${degree}/${year}/`;

    const result = await pool.query(
      `SELECT student_number FROM students WHERE student_number LIKE $1 ORDER BY student_number DESC LIMIT 1`,
      [`${prefix}%`]
    );

    let nextNumber = 1;
    if (result.rows.length > 0) {
      const lastDigits = result.rows[0].student_number.split('/').pop();
      nextNumber = parseInt(lastDigits) + 1;
    }

    res.json({ generatedId: `${prefix}${nextNumber.toString().padStart(4, '0')}` });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate ID" });
  }
});

// 2. Add Student AND Enrollments
app.post('/api/students', async (req, res) => {
  const client = await pool.connect(); 
  try {
    const { student_number, intake_number, first_name, last_name, address, birthday, degree_program, courses } = req.body;
    await client.query('BEGIN'); 

    const newStudent = await client.query(
      `INSERT INTO students (student_number, intake_number, first_name, last_name, address, birthday, degree_program)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [student_number, intake_number, first_name, last_name, address, birthday, degree_program]
    );

    if (courses && courses.length > 0) {
      for (const courseCode of courses) {
        const courseRes = await client.query('SELECT id FROM courses WHERE course_code = $1', [courseCode]);
        if (courseRes.rows.length > 0) {
          await client.query(
            `INSERT INTO enrollments (student_id, course_id, semester) VALUES ($1, $2, $3)`,
            [newStudent.rows[0].id, courseRes.rows[0].id, 1]
          );
        }
      }
    }
    await client.query('COMMIT'); 
    res.status(201).json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK'); 
    res.status(500).json({ error: "Failed to add student" });
  } finally {
    client.release();
  }
});

// 3. GET ALL STUDENTS (With their courses)
app.get('/api/students', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id as uuid, s.student_number as id, s.first_name, s.last_name, s.degree_program as degree, 
        s.intake_number as intake, s.status, s.address, s.birthday, s.current_semester,
        COALESCE(json_agg(json_build_object('code', c.course_code, 'name', c.course_name, 'sem', e.semester)) FILTER (WHERE c.id IS NOT NULL), '[]') as enrollments
      FROM students s
      LEFT JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN courses c ON e.course_id = c.id
      GROUP BY s.id ORDER BY s.registration_date DESC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve students" });
  }
});

// 4. UPDATE STUDENT (Personal Info & Current Courses)
app.put('/api/students/:uuid', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { uuid } = req.params;
    const { name, address, status, currentCourses } = req.body;
    
    const [first_name, ...lastNameArr] = name.split(' ');
    const last_name = lastNameArr.join(' ') || '';

    // Update Details
    await client.query(
      `UPDATE students SET first_name = $1, last_name = $2, address = $3, status = $4 WHERE id = $5`,
      [first_name, last_name, address, status, uuid]
    );

    // Update Enrollments: Remove old current-semester courses, insert new ones
    const sRes = await client.query(`SELECT current_semester FROM students WHERE id = $1`, [uuid]);
    const currentSem = sRes.rows[0].current_semester;

    await client.query(`DELETE FROM enrollments WHERE student_id = $1 AND semester = $2`, [uuid, currentSem]);

    for(const courseStr of currentCourses) {
      const code = courseStr.split(' - ')[0]; 
      const cRes = await client.query(`SELECT id FROM courses WHERE course_code = $1`, [code]);
      if(cRes.rows.length > 0) {
        await client.query(`INSERT INTO enrollments (student_id, course_id, semester) VALUES ($1, $2, $3)`, [uuid, cRes.rows[0].id, currentSem]);
      }
    }

    await client.query('COMMIT');
    res.json({ message: "Updated Successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Failed to update student" });
  } finally {
    client.release();
  }
});

// 5. BULK UPGRADE SEMESTER (UPDATED: Marks old courses as 'Completed')
app.post('/api/students/bulk-upgrade', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { studentIds, courses } = req.body;
    
    for (const uuid of studentIds) {
      // 1. Mark all CURRENT active courses as 'Completed'
      await client.query(
        `UPDATE enrollments SET status = 'Completed' WHERE student_id = $1 AND status = 'Active'`, 
        [uuid]
      );

      // 2. Upgrade the student's semester
      const sRes = await client.query(
        `UPDATE students SET current_semester = current_semester + 1 WHERE id = $1 RETURNING current_semester`, 
        [uuid]
      );
      const newSem = sRes.rows[0].current_semester;

      // 3. Add the new courses as 'Active'
      for(const courseStr of courses) {
        const code = courseStr.split(' - ')[0];
        const cRes = await client.query(`SELECT id FROM courses WHERE course_code = $1`, [code]);
        if(cRes.rows.length > 0) {
          await client.query(
            `INSERT INTO enrollments (student_id, course_id, semester, status) VALUES ($1, $2, $3, 'Active')`, 
            [uuid, cRes.rows[0].id, newSem]
          );
        }
      }
    }
    await client.query('COMMIT');
    res.json({ message: "Upgraded Successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Upgrade error:", err.message);
    res.status(500).json({ error: "Failed to upgrade semester" });
  } finally {
    client.release();
  }
});

// 6. BULK ADD COURSE
app.post('/api/students/bulk-enroll', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { studentIds, courses } = req.body;
    
    for (const uuid of studentIds) {
      const sRes = await client.query(`SELECT current_semester FROM students WHERE id = $1`, [uuid]);
      const currentSem = sRes.rows[0].current_semester;

      for(const courseStr of courses) {
        const code = courseStr.split(' - ')[0];
        const cRes = await client.query(`SELECT id FROM courses WHERE course_code = $1`, [code]);
        if(cRes.rows.length > 0) {
          // Prevent duplicate enrollments in the same semester
          const exist = await client.query(`SELECT 1 FROM enrollments WHERE student_id = $1 AND course_id = $2 AND semester = $3`, [uuid, cRes.rows[0].id, currentSem]);
          if(exist.rows.length === 0) {
            await client.query(`INSERT INTO enrollments (student_id, course_id, semester) VALUES ($1, $2, $3)`, [uuid, cRes.rows[0].id, currentSem]);
          }
        }
      }
    }
    await client.query('COMMIT');
    res.json({ message: "Courses Added Successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Failed to enroll in courses" });
  } finally {
    client.release();
  }
});

// 7. DELETE STUDENT
app.delete('/api/students/:uuid', async (req, res) => {
  try {
    await pool.query(`DELETE FROM students WHERE id = $1`, [req.params.uuid]);
    res.json({ message: "Student deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete student." });
  }
});

// --- START THE SERVER ---
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Student Service is running on http://localhost:${port}`);
  });
}

module.exports = app; // Export for Jest testing