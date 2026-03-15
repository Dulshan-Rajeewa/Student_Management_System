# KDU Student Management System (SMS) 🎓

A modern, scalable Student Management System built for General Sir John Kotelawala Defence University (KDU). This application utilizes a **Microservices Architecture** to independently manage students, courses, and system audit logs.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

---

## 🎥 Project Demo
**[Watch the Full Demo Video Here](https://youtu.be/iaspvp4PzzM)**

---

## ✨ Key Features
* **Interactive Dashboard:** Real-time KPIs for Total Students, Active Courses, and dynamic Intake summaries.
* **Smart Registration:** Auto-generates unique Student IDs (e.g., `D/BSE/24/0009`) based on Degree and Intake year.
* **Advanced Student Management:** * Full CRUD capabilities for student records.
  * Side-by-side profile viewing.
  * **Bulk Actions:** Instantly upgrade multiple students to their next semester or enroll them in new modules simultaneously.
* **Course Management:** Track course details and monitor live enrollment counts dynamically.
* **Immutable Audit Trailing:** Automatically tracks and logs every Admin action (Creates, Updates, Deletes) across the system.

---

## 🏗️ Architecture
This project implements a **Microservices Architecture** to ensure separation of concerns and scalability. 

* **Frontend:** React.js (Port `3000`)
* **Student Service:** Node.js / Express (Port `8081`) - Handles student records and enrollments.
* **Course Service:** Node.js / Express (Port `8082`) - Manages course catalogs.
* **Audit Service:** Node.js / Express (Port `8083`) - Maintains the immutable system log.
* **Database:** Supabase (PostgreSQL) with Connection Pooling.

---

## 🚀 Getting Started (Using Docker)
The easiest way to run this application is using Docker. The entire environment is containerized.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 1. Environment Setup
Create a `.env` file inside the following three directories:
* `services/student-service/.env`
* `services/course-service/.env`
* `services/audit-service/.env`

Add your Supabase Postgres connection string to each file:
\`\`\`env
PORT=808X
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require"
\`\`\`

### 2. Build and Run
Open your terminal in the root directory (where `docker-compose.yml` is located) and run:
\`\`\`bash
docker-compose up --build
\`\`\`

### 3. Access the App
* Open your browser and navigate to: `http://localhost:3000`
* **Test Login Credentials:**
  * Email: `admin@kdu.ac.lk`
  * Password: `admin`

---

## 🗄️ Database Schema
The system uses a relational PostgreSQL database with the following core tables:
1. `administrators`: Stores admin credentials (Used for UI mocking).
2. `students`: Core student demographics and current status.
3. `courses`: Available university modules and credit details.
4. `enrollments`: Junction table linking Students and Courses with active/completed status and semester tracking.
5. `audit_logs`: Append-only table recording system modifications.

---

## 🛠️ Tech Stack & Libraries
* **Frontend:** React, React Router Dom, React Icons (No heavy CSS frameworks used; purely custom CSS).
* **Backend:** Node.js, Express, `pg` (PostgreSQL client), CORS.
* **Deployment:** Docker, Docker Compose.

---
*Developed for the KDU Software Engineering Module Assignment.(D/BSE/24/0009)*