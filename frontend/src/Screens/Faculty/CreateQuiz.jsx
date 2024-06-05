import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import { createQuizFailure } from '../../redux/actions';

import Heading from '../../components/Heading';
import Quiz from './Quiz';
import { baseApiURL } from '../../baseUrl';

const CreateQuiz = () => {
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [marksPerQuestion, setMarksPerQuestion] = useState('');
    const [correctOption, setCorrectOption] = useState('');
    const [deadline, setDeadline] = useState('');
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');

    const [currentQuestion, setCurrentQuestion] = useState('');
    const [options, setOptions] = useState([
        { text: '' },
        { text: '' },
        { text: '' },
        { text: '' },
    ]);
    const dispatch = useDispatch();
    const jwtToken = useSelector((state) => state.jwtToken);
    const userInfo = useSelector((state) => state.userInfo);

    const [redirectToQuiz, setRedirectToQuiz] = useState(false);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        axios
            .get(
                `${baseApiURL}/faculty/details/getDetails/${userInfo.userDetails._id}`
            )
            .then(async (response) => {
                const departmentIds = response.data.user.departments;
                const departmentNames = await Promise.all(
                    departmentIds.map(async (id) => {
                        const departmentResponse = await axios.get(
                            `${baseApiURL}/department/getDepartment/${id}`
                        );
                        return departmentResponse.data.department.name;
                    })
                );
                setDepartments(departmentNames);

            })
            .catch((error) =>
                console.error('Error fetching departments:', error)
            );

        axios
            .get(
                `${baseApiURL}/faculty/details/getDetails/${userInfo.userDetails._id}`
            )
            .then((response) => {
                setSemesters(response.data.user.semesters);
            })
            .catch((error) =>
                console.error('Error fetching departments:', error)
            );

        axios
            .get(
                `${baseApiURL}/faculty/details/getDetails/${userInfo.userDetails._id}`
            )
            .then(async (response) => {
                const subjectIds = response.data.user.subjects;
                const subjectNames = await Promise.all(
                    subjectIds.map(async (id) => {
                        const subjectResponse = await axios.get(
                            `${baseApiURL}/subject/getSubject/${id}`
                        );
                        return subjectResponse.data.subject.name;
                    })
                );
                setSubjects(subjectNames);
            })
            .catch((error) =>
                console.error('Error fetching subjects:', error)
            );
    }, [userInfo.userDetails._id]);


    const handleOptionChange = (index, value) => {
        const updatedOptions = [...options];
        updatedOptions[index] = { text: value };
        setOptions(updatedOptions);
    };

    const handleSaveQuestion = () => {
        if (
            currentQuestion.trim() === '' ||
            correctOption.trim() === '' ||
            options.some((option) => option.text.trim() === '')
        ) {
            toast.error('Incomplete question information');
            return;
        }

        const newQuestion = {
            text: currentQuestion,
            options: options.map((option) => ({ text: option.text })),
            correctOption,
        };

        setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);

        setCurrentQuestion('');
        setCorrectOption('');
        setOptions([
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
        ]);
    };

    const handleAddNewQuestion = () => {
        if (currentQuestion.trim() !== '') {
            const newQuestion = {
                text: currentQuestion,
                options: options.map((option) => ({ text: option.text })),
                correctOption,
            };

            setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
        }

        setCurrentQuestion('');
        setCorrectOption('');
        setOptions([
            { text: '' },
            { text: '' },
            { text: '' },
            { text: '' },
        ]);
    };

    const handleCreateQuiz = async () => {
        try {
            if (questions.length === 0) {
                toast.error('Add at least one question');
                return;
            }

            const response = await axios.post(
                '${baseApiURL}/quiz/create',
                {
                    semester: selectedSemester,
                    subject: selectedSubject,
                    department: selectedDepartment,
                    deadline,
                    marksPerQuestion,
                    duration,
                    teacherId: userInfo.userId,
                    questions,
                    title,
                },
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                }
            );

            // Reset the form and questions array
            setCurrentQuestion('');
            setCorrectOption('');
            setOptions([
                { text: '' },
                { text: '' },
                { text: '' },
                { text: '' },
            ]);
            setQuestions([]);

            setRedirectToQuiz(true);
        } catch (error) {
            console.error('Error creating quiz:', error);
            dispatch(createQuizFailure());
        }
    };

    if (redirectToQuiz) {
        return <Quiz />;
    }

    return (
        <div className="w-[85%] mx-auto flex justify-center items-start flex-col my-10 mt-7">
            <Heading title={`Create Quiz`} />
            <div className="relative flex flex-col lg:flex-row justify-between items-center w-full gap-1">
                <div className="mt-4 w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="department" className="leading-7 text-base ">
                        Select Department
                    </label>
                    <select
                        id="department"
                        className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        {departments.map((department, index) => (
                            <option key={index} value={department}>
                                {department}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-4 w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="semester" className="leading-7 text-base">
                        Select Semester
                    </label>
                    <select
                        id="semester"
                        className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        {semesters.map((semester, index) => (
                            <option key={index} value={semester}>
                                {`${semester} Semester`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-4 w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="subject" className="leading-7 text-base ">
                        Select Subject
                    </label>
                    <select
                        id="subject"
                        className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        {subjects.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-4 w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="duration" className="leading-7 text-base">
                        Duration (minutes)
                    </label>
                    <input
                        id="duration"
                        type="text"
                        className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    />
                </div>
            </div>

            <div className="relative flex flex-col lg:flex-row items-center w-full gap-1">
                <div className="mt-4 w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="marks" className="leading-7 text-base">
                        Marks per Question
                    </label>
                    <input
                        id="marks"
                        className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                        value={marksPerQuestion}
                        onChange={(e) => setMarksPerQuestion(e.target.value)}
                    />
                </div>

                <div className="mt-4 w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="date" className="leading-7 text-base">
                        Deadline
                    </label>
                    <input
                        type="date"
                        id="date"
                        className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                </div>

                <div className="mt-4 w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="title" className="leading-7 text-base">
                        Title
                    </label>
                    <input
                        id="title"
                        className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
            </div>

            <div className="mt-6 w-full">
                <label htmlFor="question" className="leading-7 text-base">
                    Question
                </label>
                <input
                    type="text"
                    id="question"
                    className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                />

                {/* Options */}
                {options.map((option, index) => (
                    <div key={index} className="mt-3">
                        <label htmlFor={`option${index}`} className="leading-7 text-base">
                            Option {index + 1}
                        </label>
                        <input
                            type="text"
                            id={`option${index}`}
                            className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                        />
                    </div>
                ))}

                <div className="mt-3">
                    <label htmlFor="correctOption" className="leading-7 text-base">
                        Correct Option
                    </label>
                    <input
                        id="correctOption"
                        type="text"
                        className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                        value={correctOption}
                        onChange={(e) => setCorrectOption(e.target.value)}
                    />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex mt-4">
                <button
                    className={`bg-blue-500 px-4 py-2 mr-2 rounded border-2 border-blue-500 text-black ${!currentQuestion.trim() ||
                        !correctOption.trim() ||
                        options.some((option) => !option.text.trim())
                        ? 'disabled'
                        : ''}`}
                    onClick={handleSaveQuestion}
                    disabled={
                        !currentQuestion.trim() ||
                        !correctOption.trim() ||
                        options.some((option) => !option.text.trim())
                    }
                >
                    Save Question
                </button>
                <button
                    className={`bg-blue-500 px-4 py-2 mr-2 rounded border-2 border-blue-500 text-black ${!currentQuestion.trim() ||
                        !correctOption.trim() ||
                        options.some((option) => !option.text.trim())
                        ? 'disabled'
                        : ''}`}
                    onClick={handleAddNewQuestion}
                    disabled={
                        !currentQuestion.trim() ||
                        !correctOption.trim() ||
                        options.some((option) => !option.text.trim())
                    }
                >
                    Add New Question
                </button>
                <button
                    className={`bg-blue-500 px-4 py-2 mr-2 rounded border-2 border-blue-500 text-black ${!selectedDepartment ||
                        !selectedSemester ||
                        !selectedSubject ||
                        !marksPerQuestion ||
                        !deadline ||
                        questions.length === 0
                        ? 'disabled'
                        : ''}`}
                    onClick={handleCreateQuiz}
                    disabled={
                        !selectedDepartment ||
                        !selectedSemester ||
                        !selectedSubject ||
                        !marksPerQuestion ||
                        !deadline ||
                        !title ||
                        questions.length === 0
                    }
                >
                    Submit Quiz
                </button>
            </div>
        </div>
    );
};

export default CreateQuiz;
