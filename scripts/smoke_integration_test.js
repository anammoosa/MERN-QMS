const axios = require('axios');

const BASE_URL = 'http://localhost:8002/api';
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'adminpassword123'
};

const INSTRUCTOR_CREDENTIALS = {
    username: 'test_instructor_1',
    password: 'password123'
};

const STUDENT_CREDENTIALS = {
    username: 'test_student_1',
    password: 'password123'
};

async function log(msg, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${msg}`);
}

async function runTest() {
    try {
        log('Starting Smoke Integration Test...');

        // 1. Health Check (Root)
        try {
            const rootRes = await axios.get('http://localhost:8002/');
            log(`Gateway Root Check: ${rootRes.data}`, 'SUCCESS');
        } catch (e) {
            log(`Gateway Root Check Failed: ${e.message}`, 'ERROR');
            process.exit(1);
        }

        // 1.5 Register Student (Verification of DB)
        try {
            await axios.post(`${BASE_URL}/auth/register`, STUDENT_CREDENTIALS);
            log('Student Registration Successful', 'SUCCESS');
        } catch (e) {
            if (e.response && (e.response.status === 400 || e.response.data?.message?.includes('exists'))) {
                log('Student User already exists', 'INFO');
            } else {
                log(`Student Registration Failed: ${e.response?.data?.message || e.message}`, 'ERROR');
            }
        }

        // 1.6 Login Student
        try {
            await axios.post(`${BASE_URL}/auth/login`, STUDENT_CREDENTIALS);
            log('Student Login Successful', 'SUCCESS');
        } catch (e) {
            log(`Student Login Failed: ${e.response?.data?.message || e.message}`, 'ERROR');
        }

        // 2. Admin Login
        // Debug: Check if admin exists
        try {
            await axios.post(`${BASE_URL}/auth/register`, ADMIN_CREDENTIALS);
            log('WARNING: Registered "admin" user via API - It did not exist!', 'WARN');
        } catch (e) {
            if (e.response?.data?.message === 'Username already exists') {
                log('Admin user exists (Good)', 'INFO');
            } else {
                log(`Admin Register Check Failed: ${e.response?.data?.message || e.message}`, 'INFO');
            }
        }

        let adminToken;
        try {
            const res = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
            adminToken = res.data.token;
            log('Admin Login Successful', 'SUCCESS');
        } catch (e) {
            log(`Admin Login Failed: ${e.response?.data?.message || e.message}`, 'ERROR');
            process.exit(1);
        }

        // 3. Create Instructor User
        // Check if exists first by trying to login? No, create and handle 400 "user exists"
        try {
            await axios.post(`${BASE_URL}/auth/create-user`, {
                username: INSTRUCTOR_CREDENTIALS.username,
                password: INSTRUCTOR_CREDENTIALS.password,
                role: 'Instructor'
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            log('Created Instructor User', 'SUCCESS');
        } catch (e) {
            if (e.response && (e.response.status === 400 || e.response.data?.message?.includes('exists'))) {
                log('Instructor User already exists (Skipping creation)', 'INFO');
            } else {
                log(`Create Instructor Failed: ${e.response?.data?.message || e.message}`, 'ERROR');
                // Don't exit, might be able to login
            }
        }

        // 4. Login as Instructor
        let instructorToken;
        let instructorId;
        try {
            const res = await axios.post(`${BASE_URL}/auth/login`, INSTRUCTOR_CREDENTIALS);
            instructorToken = res.data.token;
            instructorId = res.data.user.id;
            log(`Instructor Login Successful (ID: ${instructorId})`, 'SUCCESS');
        } catch (e) {
            log(`Instructor Login Failed: ${e.response?.data?.message || e.message}`, 'ERROR');
            process.exit(1);
        }

        // 5. Create Quiz
        const quizPayload = {
            title: "Smoke Test Quiz " + Date.now(),
            description: "Automated test quiz",
            instructorId: instructorId,
            questions: [
                {
                    text: "What is 2+2?",
                    type: "MCQ",
                    options: ["3", "4", "5", "6"],
                    correctAnswer: "4",
                    points: 5
                },
                {
                    text: "Is the sky blue?",
                    type: "True/False",
                    options: ["True", "False"],
                    correctAnswer: "True",
                    points: 5
                }
            ],
            duration: 60,
            isPublished: true
        };

        try {
            const res = await axios.post(`${BASE_URL}/quizzes/create`, quizPayload, {
                headers: { Authorization: `Bearer ${instructorToken}` }
            });
            log(`Quiz Created: ${res.data.title} (ID: ${res.data._id})`, 'SUCCESS');
        } catch (e) {
            log(`Quiz Creation Failed: ${e.response?.data?.message || e.message}`, 'ERROR');
            log(`Details: ${JSON.stringify(e.response?.data)}`, 'DEBUG');
            process.exit(1);
        }

        // 6. Fetch Quizzes
        try {
            const res = await axios.get(`${BASE_URL}/quizzes`, {
                headers: { Authorization: `Bearer ${instructorToken}` } // Should work for instructor
            });
            const myQuiz = res.data.find(q => q.title === quizPayload.title);
            if (myQuiz) {
                log('Fetched Quizzes List: Found created quiz', 'SUCCESS');
            } else {
                log('Fetched Quizzes List: Created quiz NOT found', 'WARN');
            }
        } catch (e) {
            log(`Fetch Quizzes Failed: ${e.response?.data?.message || e.message}`, 'ERROR');
        }

        log('Smoke Test Completed Successfully', 'SUCCESS');

    } catch (err) {
        log(`Unexpected Error: ${err.message}`, 'FATAL');
        process.exit(1);
    }
}

runTest();
