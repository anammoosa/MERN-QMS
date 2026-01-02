import { useState, useCallback } from 'react';
import { quizService, assessmentService } from '../services/api';

export const useQuiz = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [currentQuiz, setCurrentQuiz] = useState(null);

    // Helper to handle API calls
    const apiCall = useCallback(async (action) => {
        setLoading(true);
        setError(null);
        try {
            const response = await action();
            return response.data;
        } catch (err) {
            const message = err.response?.data?.message || err.message;
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch all quizzes
    const getQuizzes = useCallback(async (instructorId = null) => {
        return apiCall(async () => {
            return instructorId
                ? quizService.getInstructorQuizzes(instructorId)
                : quizService.getQuizzes();
        }).then(data => {
            setQuizzes(data);
            return data;
        });
    }, [apiCall]);

    // Get a single quiz
    const getQuiz = useCallback(async (id) => {
        return apiCall(async () => {
            return quizService.getQuiz(id);
        }).then(data => {
            setCurrentQuiz(data);
            return data;
        });
    }, [apiCall]);

    // Submit Quiz (Async)
    const submitQuiz = useCallback(async (quizId, answers) => {
        return apiCall(async () => {
            return assessmentService.submitQuiz({ quizId, answers });
        });
    }, [apiCall]);

    // Check Submission Status
    const checkSubmissionStatus = useCallback(async (submissionId) => {
        // Placeholder or future implementation
        return { status: 'Pending Implementation' };
    }, []);

    return {
        loading,
        error,
        quizzes,
        currentQuiz,
        getQuizzes,
        getQuiz,
        submitQuiz,
        checkSubmissionStatus
    };
};
