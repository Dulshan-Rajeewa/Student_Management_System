const request = require('supertest');
const app = require('./index'); // Import your Express app
const { Pool } = require('pg'); // Import the Postgres driver

// 1. MOCK THE DATABASE
// We tell Jest to fake the database connection so we don't accidentally delete real data during tests
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('Course Service API Unit Tests', () => {
  let pool;

  beforeEach(() => {
    pool = new Pool();
    jest.clearAllMocks(); // Clear fake database history before every test
  });

  // TEST 1: Health Check
  it('GET /api/courses/health - should return 200 and a success message', async () => {
    const res = await request(app).get('/api/courses/health');
    
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Course Service is up');
  });

  // TEST 2: Get All Courses
  it('GET /api/courses - should return a list of courses', async () => {
    // Fake data that the fake database will return
    const mockCourses = [
      { id: '1', course_code: 'SE3032', course_name: 'Software Construction', enrolled_count: 50 }
    ];
    
    // Tell the fake DB to resolve with our fake data
    pool.query.mockResolvedValue({ rows: mockCourses });

    const res = await request(app).get('/api/courses');

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].course_code).toEqual('SE3032');
    expect(pool.query).toHaveBeenCalledTimes(1); // Prove the DB was called once
  });

  // TEST 3: Add New Course
  it('POST /api/courses - should create a new course and return 201', async () => {
    const newCourseData = {
      course_code: 'IT1010',
      course_name: 'Intro to IT',
      description: 'Basic IT concepts',
      credits: 3
    };

    // Fake the database returning the newly created row
    pool.query.mockResolvedValue({ 
      rows: [{ id: '123', ...newCourseData }] 
    });

    const res = await request(app)
      .post('/api/courses')
      .send(newCourseData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.code).toEqual('IT1010');
    expect(res.body.enrolled_count).toEqual(0); // Verifying our backend logic works
  });

  // TEST 4: Handle Database Error Safely
  it('GET /api/courses - should return 500 if database crashes', async () => {
    // Tell the fake DB to throw a massive error
    pool.query.mockRejectedValue(new Error('Database disconnected'));

    const res = await request(app).get('/api/courses');

    expect(res.statusCode).toEqual(500);
    expect(res.body.error).toEqual('Failed to retrieve courses.');
  });
});