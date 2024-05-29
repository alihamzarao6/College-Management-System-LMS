import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

import Quiz from './Quiz';

const ResultPage = () => {
    const [quizResult, setQuizResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [backToQuizPage, setBackToQuizPage] = useState(false);

    const quizId = useSelector((state) => state.quizId);
    const jwtToken = useSelector((state) => state.jwtToken);

    useEffect(() => {
        const fetchQuizResult = async (quizId) => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/quiz/result/teacher/${quizId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${jwtToken}`,
                        },
                    }
                );

                setQuizResult(response.data.result);
            } catch (error) {
                console.error('Error fetching quiz result:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizResult(quizId);
    }, [quizId, jwtToken]);

    const backtoQuiz = () => {
        setBackToQuizPage(true);
    };

    if (backToQuizPage) {
        return <Quiz />;
    }

    return (
        <div className="container mx-auto my-8">
            <h1 className="text-3xl font-semibold mb-6">Quiz Result</h1>
            {loading && <p>Loading...</p>}
            {!loading && quizResult && quizResult.studentsSupposedToAttempt.length > 0 ? (
                <>
                    <div className="mb-4">
                        <p>
                            <strong>Title:</strong> {quizResult.quiz.title}
                        </p>
                        <p>
                            <strong>Quiz Name:</strong> {quizResult.quiz.subject} -{' '}
                            <strong>Semester</strong> {quizResult.quiz.semester}
                        </p>
                        <p>
                            <strong>Deadline:</strong>{' '}
                            {new Date(quizResult.quiz.deadline).toLocaleString()}
                        </p>
                        <p>
                            <strong>Total Marks:</strong> {quizResult.quiz.totalMarks}
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="p-2 border">Enrollment No</th>
                                    <th className="p-2 border">Name</th>
                                    <th className="p-2 border">Attempted</th>
                                    <th className="p-2 border">Obtained Marks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quizResult.studentsSupposedToAttempt.map((row, index) => (
                                    <tr key={index}>
                                        <td className="p-2 border text-center">{row.enrollmentNo}</td>
                                        <td className="p-2 border text-center">{`${row.firstName} ${row.lastName}`}</td>
                                        <td className="p-2 border text-center">
                                            {row.completed ? 'Yes' : 'No'}
                                        </td>
                                        <td className="p-2 border text-center">{row.obtainedMarks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <p>No quiz results available</p>
            )}

            <button
                className="bg-blue-500 text-white px-4 py-2 rounded mt-4 ml-auto"
                onClick={backtoQuiz}
            >
                Back to Quiz
            </button>
        </div>
    );
};

export default ResultPage;
