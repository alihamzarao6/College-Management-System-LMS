import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Heading from '../../components/Heading';
import toast from 'react-hot-toast';

import { getTeacherQuizzes, setQuizId } from '../../redux/actions';

import CreateQuiz from './CreateQuiz';
import QuizDisplay from './QuizDisplay';
import ResultPage from './ResultPage';
import { baseApiURL } from '../../baseUrl';

const Quiz = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const jwtToken = useSelector((state) => state.jwtToken);
    const quizzes = useSelector((state) => state.quizzes);

    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const [availableDepartments, setAvailableDepartments] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);

    const [createQuizClicked, setCreateQuizClicked] = useState(false);

    const [openQuizPage, setOpenQuizPage] = useState(false);
    const [openResultPage, setOpenResultPage] = useState(false);
    const [quizData, setQuizData] = useState({});

    const [currentPage, setCurrentPage] = useState(1);
    const [quizzesPerPage] = useState(6);

    useEffect(() => {
        dispatch(getTeacherQuizzes(quizzes));
        // console.log(quizzes);
    }, [dispatch, quizzes]);

    useEffect(() => {
        axios
            .get(`${baseApiURL}/quiz/teacher`, {
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

                dispatch(getTeacherQuizzes(fetchedQuizzes));
            })
            .catch((error) => {
                console.error(error);
                toast.error(error.message);
            });
    }, [dispatch, jwtToken]);

    const handleCreateQuiz = () => {
        setCreateQuizClicked(true);
    };

    if (createQuizClicked) {
        return <CreateQuiz />;
    }

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

    const handleOpenQuiz = async (quizId) => {
        try {
            const response = await axios.get(`${baseApiURL}/quiz/quizzes/${quizId}`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            const quizData = response.data.quiz;

            setQuizData(quizData);
            setOpenQuizPage(true);
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    if (openQuizPage) {
        return <QuizDisplay quizData={quizData} />;
    }

    const handleViewResult = (quizId) => {
        dispatch(setQuizId(quizId));
        setOpenResultPage(true);
    };

    if (openResultPage) {
        return <ResultPage />;
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
        <div className="container mx-auto p-4">
            <Heading title={`Quizzes`} />

            <div className="mt-5 font-semibold gap-1">
                <p>Filter Your Created Quizzes:</p>
            </div>

            <div className="mb-4 flex flex-col gap-1 lg:flex-row">
                <select
                    className="border rounded p-2 mb-2 sm:mb-0"
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
                    className="border rounded p-2 mb-2 sm:mb-0"
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
                    className="border rounded p-2 mb-2 sm:mb-0"
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

            <div className="mb-4 mt-4 flex flex-col gap-1 lg:flex-row">
                <button
                    className="bg-blue-500 text-white px-2 py-2 rounded"
                    onClick={handleCreateQuiz}
                >
                    Create a New Quiz
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {currentQuizzes.map((quiz) => (
                    <div key={quiz._id} className="border p-4 px-3 my-4">
                        <div>
                            <p>{`Title: ${quiz?.title}`}</p>
                            <p>{`Semester: ${quiz?.semester}`}<span className="ml-4">{`Subject: ${quiz?.subject}`}</span></p>
                            <p>{`Deadline: ${new Date(quiz?.deadline).toLocaleString()}`}</p>
                            <p>{`Duration: ${quiz?.duration} mins`}</p>

                        </div>

                        <div className="flex justify-end mt-2">
                            <button
                                className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                                onClick={() => handleOpenQuiz(quiz._id)}
                            >
                                Open
                            </button>
                            <button
                                className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                                onClick={() => handleViewResult(quiz._id)}
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
