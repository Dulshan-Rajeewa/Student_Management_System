const request = require('supertest');

// 1. MOCK THE DATABASE 
// (We use 'var' instead of 'const' to prevent the Jest Hoisting crash!)
var mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

var mockPool = {
  query: jest.fn(),
  // Ensure connect returns a Promise since our backend uses 'await pool.connect()'
  connect: jest.fn().mockResolvedValue(mockClient), 
};

jest.mock('pg', () => {
  return { Pool: jest.fn(() => mockPool) };
});

// IMPORT APP *AFTER* MOCKING!
const app = require('./index');

describe('Student Service API Unit Tests', () => {
  
  beforeEach(() => {
    jest.clearAllMocks(); // Reset our fake database before each test
  });

  // TEST 1: Health Check
  it('GET /api/students/health - should return 200', async () => {
    const res = await request(app).get('/api/students/health');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Student Service is up');
  });

  // TEST 2: Generate ID Logic
  it('GET /api/students/generate-id - should generate ID 0001 for a new intake', async () => {
    // Fake the DB saying "No students exist for this intake yet"
    mockPool.query.mockResolvedValue({ rows: [] });

    // Test Intake 41 (which maps to Year 24) and BSE
    const res = await request(app).get('/api/students/generate-id?degree=BSE&intake=41');

    expect(res.statusCode).toEqual(200);
    // Because the DB was empty, it should start at 0001!
    expect(res.body.generatedId).toEqual('D/BSE/24/0001');
    expect(mockPool.query).toHaveBeenCalledTimes(1);
  });

  // TEST 3: Get All Students (Testing complex JOINs safely)
  it('GET /api/students - should return formatted list of students', async () => {
    const fakeDBData = [{
      uuid: 'abc-123',
      id: 'D/BSE/24/0001',
      first_name: 'Dulshan',
      enrollments: [] // Fake empty json_agg array
    }];
    
    mockPool.query.mockResolvedValue({ rows: fakeDBData });

    const res = await request(app).get('/api/students');

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].first_name).toEqual('Dulshan');
  });

  // TEST 4: The Complex Transaction (Adding a Student)
  it('POST /api/students - should use a transaction to save student and commit', async () => {
    // 1. Fake the INSERT returning a new Student ID
    mockClient.query.mockResolvedValueOnce(); // Fakes the 'BEGIN'
    mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'new-uuid', student_number: 'D/BSE/24/0001' }] }); // Fakes the student INSERT
    mockClient.query.mockResolvedValueOnce(); // Fakes the 'COMMIT'

    const newStudentPayload = {
      student_number: 'D/BSE/24/0001',
      intake_number: '41',
      first_name: 'John',
      last_name: 'Doe',
      degree_program: 'BSE',
      courses: [] // Testing without courses for simplicity
    };

    const res = await request(app)
      .post('/api/students')
      .send(newStudentPayload);

    expect(res.statusCode).toEqual(201);
    // Prove that a Database Transaction was actually opened and closed!
    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    expect(mockClient.release).toHaveBeenCalled(); // Prove the connection was closed safely
  });

  // TEST 5: Deleting a Student
  it('DELETE /api/students/:uuid - should delete a student and return 200', async () => {
    mockPool.query.mockResolvedValue({ rowCount: 1 }); // Fake a successful deletion

    const res = await request(app).delete('/api/students/abc-123');

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Student deleted.');
  });
});