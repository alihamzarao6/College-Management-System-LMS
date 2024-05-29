import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Heading from '../../components/Heading';
import toast from 'react-hot-toast';

import { fetchStudentQuizzesSuccess, startQuizTimer, setQuizTimer, updateAnswerEmpty, setQuizInProgress } from '../../redux/actions';

import QuizDisplay from './QuizDisplay';
import ResultPage from './ResultPage';

const Quiz = () => {
    const dispatch = useDispatch();

    const jwtToken = useSelector((state) => state.jwtToken);
    const quizzes = useSelector((state) => state.quizzes);
    const userId = useSelector((state) => state.userInfo.userId);

    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const [availableDepartments, setAvailableDepartments] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);

    const [openQuizPage, setOpenQuizPage] = useState(false);
    const [openResultPage, setOpenResultPage] = useState(false);
    const [quizData, setQuizData] = useState({});
    const [quizIdResult, setQuizIdResult] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [quizzesPerPage] = useState(6);

    useEffect(() => {
        dispatch(fetchStudentQuizzesSuccess(quizzes));
        // console.log(quizzes);
    }, [dispatch, quizzes]);

    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/quiz/student`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            })
            .then((response) => {
                const fetchedQuizzes = response.data.quizzes;

                const uniqueDepartments = [...new Set(fetchedQuizzes.map((quiz) => quiz.department))];
                const uniqueSemesters = [...new Set(fetchedQuizzes.map((quiz) => quiz.semester))];
                const uniqueSubjects = [...new Set(fetchedQuizzes.map((quiz) => quiz.subject))];

                setAvailableDepartments(uniqueDepartments);
                setAvailableSemesters(uniqueSemesters);
                setAvailableSubjects(uniqueSubjects);

                dispatch(fetchStudentQuizzesSuccess(fetchedQuizzes));
            })
            .catch((error) => {
                console.error(error);
                toast.error('Please login again to get your quizzes');
            });
    }, [dispatch, jwtToken]);

    const handleFilterChange = (filter, value) => {
        if (filter === 'department') {
            setSelectedDepartment(value);
        } else if (filter === 'semester') {
            setSelectedSemester(String(value));
        } else if (filter === 'subject') {
            setSelectedSubject(value);
        }

        setCurrentPage(1);
    };

    const filteredQuizzes = quizzes.filter((quiz) => {
        return (
            (!selectedDepartment || quiz.department === selectedDepartment) &&
            (!selectedSemester || quiz.semester.toString() === selectedSemester) &&
            (!selectedSubject || quiz.subject === selectedSubject)
        );
    });

    const indexOfLastQuiz = currentPage * quizzesPerPage;
    const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
    const currentQuizzes = filteredQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);

    const isQuizAttempted = (quizId) => {
        const quiz = quizzes.find((q) => q._id === quizId);
        return quiz && quiz.students.some((student) => student.studentId === userId && student.completed);
    };

    const isQuizExpired = (deadline) => {
        const currentDateTime = new Date();
        const quizDeadline = new Date(deadline);
        return currentDateTime > quizDeadline;
    };

    const handleOpenQuiz = async (quizId, deadline) => {
        if (isQuizAttempted(quizId) || isQuizExpired(deadline)) {
            toast.error('Quiz is either already attempted or the deadline has passed.');
        } else {
            try {
                const response = await axios.get(`http://localhost:5000/api/quiz/quizzes/${quizId}`, {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                });

                const quizData = await response.data.quiz;
                setQuizData(quizData);
                
                dispatch(startQuizTimer());

                dispatch(setQuizTimer(quizData.duration * 60));

                dispatch(setQuizInProgress());

                dispatch(updateAnswerEmpty());
                setOpenQuizPage(true);
            } catch (error) {
                console.error(error);
                toast.error(error.message);
            }
        }
    };

    if (openQuizPage) {
        return <QuizDisplay quizData={quizData} userId={userId} />;
    }

    const handleViewResult = (quizId) => {
        setQuizIdResult(quizId);
        setOpenResultPage(true);
    };

    if (openResultPage) {
        return <ResultPage quizId={quizIdResult} />;
    }

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

     const Pagination = ({ assignmentsPerPage, totalAssignments, paginate }) => {
        const pageNumbers = [];

        for (let i = 1; i <= Math.ceil(totalAssignments / assignmentsPerPage); i++) {
            pageNumbers.push(i);
        }

        return (
            <nav className="mt-4" aria-label="Page navigation">
                <ul className="pagination flex gap-1">
                    {pageNumbers.map((number) => (
                        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                            <button
                                onClick={() => paginate(number)}
                                className={`page-link ${currentPage === number ? 'bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'} px-3 py-1 rounded-md`}
                            >
                                {number}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        );
    };

    return (
        <div className="max-w-5xl mx-auto p-4">
            <Heading title={`Quizzes`} />

            <div className="mb-4 mt-4 space-y-2">
                <p className='font-semibold'>Search by filter</p>
                <select
                    className="border rounded p-2 w-full"
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                >
                    <option value="">Select Department</option>
                    {availableDepartments.map((department) => (
                        <option key={department} value={department}>
                            {department}
                        </option>
                    ))}
                </select>

                <select
                    className="border rounded p-2 w-full"
                    onChange={(e) => handleFilterChange('semester', e.target.value)}
                >
                    <option value="">Select Semester</option>
                    {availableSemesters.map((semester) => (
                        <option key={semester} value={semester}>
                            {semester}
                        </option>
                    ))}
                </select>

                <select
                    className="border rounded p-2 w-full"
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                >
                    <option value="">Select Subject</option>
                    {availableSubjects.map((subject) => (
                        <option key={subject} value={subject}>
                            {subject}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentQuizzes.map((quiz) => (
                    <div key={quiz._id} className="border p-4 px-3 my-4">
                        <p>{`Title: ${quiz?.title}`}</p>
                        <p>{`Semester: ${quiz?.semester}`}<span className="ml-4">{`Subject: ${quiz?.subject}`}</span></p>
                        <p>{`Deadline: ${new Date(quiz?.deadline).toLocaleString()}`}</p>
                        <p>{`Duration: ${quiz?.duration} mins`}</p>

                        {isQuizAttempted(quiz._id) && <p className="text-green-500 font-bold">Attempted</p>}
                        {isQuizExpired(quiz.deadline) && <p className="text-red-500 font-bold">Expired</p>}

                        <div className="flex justify-end mt-2 space-x-2">
                            <button
                                className={`bg-green-500 text-white px-2 py-1 rounded ${isQuizAttempted(quiz._id) || isQuizExpired(quiz.deadline) ? 'cursor-not-allowed opacity-50' : ''}`}
                                onClick={() => handleOpenQuiz(quiz._id, quiz.deadline)}
                                disabled={isQuizAttempted(quiz._id) || isQuizExpired(quiz.deadline)}
                            >
                                Attempt
                            </button>
                            <button
                                className={`bg-blue-500 text-white px-2 py-1 rounded ${!isQuizAttempted(quiz._id) ? 'hidden' : 'visible'}`}
                                onClick={() => handleViewResult(quiz._id)}
                                disabled={!isQuizAttempted(quiz._id)}
                            >
                                Result
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Pagination
                assignmentsPerPage={quizzesPerPage}
                totalAssignments={filteredQuizzes.length}
                paginate={paginate}
            />
        </div>
    );
};

export default Quiz;
