import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Heading from '../../components/Heading';
import UploadAssignment from "./UploadAssignment";
import toast from 'react-hot-toast';
import { fetchStudentAssignmentsSuccess } from '../../redux/actions';
import { FaDownload } from 'react-icons/fa';
import { baseApiURL } from '../../baseUrl';

const Assignment = () => {
    const dispatch = useDispatch();

    const jwtToken = useSelector((state) => state.jwtToken);
    const assignments = useSelector((state) => state.assignments);
    const userId = useSelector((state) => state.userInfo.userId);

    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const [availableDepartments, setAvailableDepartments] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);

    const [assignmentData, setAssignmentData] = useState({});
    const [assignmentId, setAssignmentId] = useState('');
    const [openUploadAssignment, setOpenUploadAssignment] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [assignmentsPerPage] = useState(6);

    useEffect(() => {
        axios
            .get(`${baseApiURL}/assignment/student`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            })
            .then((response) => {
                const fetchedAssignments = response.data.assignments;

                const uniqueDepartments = [...new Set(fetchedAssignments.map((assignment) => assignment.department))];
                const uniqueSemesters = [...new Set(fetchedAssignments.map((assignment) => assignment.semester))];
                const uniqueSubjects = [...new Set(fetchedAssignments.map((assignment) => assignment.subject))];

                setAvailableDepartments(uniqueDepartments);
                setAvailableSemesters(uniqueSemesters);
                setAvailableSubjects(uniqueSubjects);

                dispatch(fetchStudentAssignmentsSuccess(fetchedAssignments));
            })
            .catch((error) => {
                console.error(error);
                toast.error('Please login again to get your assignments');
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

    const filteredAssignments = assignments.filter((assignment) => {
        return (
            (!selectedDepartment || assignment.department === selectedDepartment) &&
            (!selectedSemester || assignment.semester.toString() === selectedSemester) &&
            (!selectedSubject || assignment.subject === selectedSubject)
        );
    });

    const indexOfLastAssignment = currentPage * assignmentsPerPage;
    const indexOfFirstAssignment = indexOfLastAssignment - assignmentsPerPage;
    const currentAssignments = filteredAssignments.slice(indexOfFirstAssignment, indexOfLastAssignment);

    const isAssignmentAttempted = (assignmentId) => {
        const assignment = assignments.find((asg) => asg._id === assignmentId);
        return assignment && assignment.submissions.some((student) => student.studentId === userId && student.completed);
    };

    const isAssignmentExpired = (deadline) => {
        const currentDateTime = new Date();
        const assignmentDeadline = new Date(deadline);
        return currentDateTime > assignmentDeadline;
    };

    const getStudentMarks = (assignmentId) => {
        const assignment = assignments.find((asg) => asg._id === assignmentId);
        const submission = assignment.submissions.find((student) => student.studentId === userId);
        return submission && submission.marks ? submission.marks : "Not Checked Yet";
    };

    const handleOpenAssignment = async (assignmentId) => {
        try {
            const response = await axios.get(`${baseApiURL}/assignment/assignments/${assignmentId}`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            const assignmentData = await response.data.assignment;
            setAssignmentData(assignmentData);

            window.open(assignmentData.file, '_blank');
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };


    const handleAttemptAssignment = (assignmentId, completed) => {
        if (completed) {
            toast.error('You have already attempted this assignment.');
        } else {
            setAssignmentId(assignmentId);
            setOpenUploadAssignment(true);
        }
    };

    if (openUploadAssignment) {
        return <UploadAssignment assignmentId={assignmentId} />
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
            <Heading title={`Assignments`} />

            {/* Filters */}
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
                {currentAssignments.map((assignment) => (
                    <div key={assignment._id} className="border p-4 px-3 my-4">
                        <p>{`Title: ${assignment?.title}`}</p>
                        <p>{`Semester: ${assignment?.semester}`}<span className="ml-4">{`Subject: ${assignment?.subject}`}</span></p>
                        <p>{`Deadline: ${new Date(assignment?.deadline).toLocaleString()}`}</p>
                        <p>{`Total Marks: ${assignment?.totalMarks}`}</p>

                        {isAssignmentAttempted(assignment._id) && (
                            <>
                                <p className="text-black-500 font-bold">
                                    Your Marks: {getStudentMarks(assignment._id)}
                                </p>
                            </>
                        )}

                        {isAssignmentAttempted(assignment._id) ? <p className="text-green-500 font-bold">Attempted</p> : <p className="text-green-500 font-bold">Not Attempted</p>}

                        {isAssignmentExpired(assignment.deadline) && <p className="text-red-500 font-bold">Expired</p>}

                        <div className="flex justify-end mt-2 space-x-2">
                            <button
                                className={`bg-blue-500 text-white px-2 py-1 rounded`}
                                onClick={() => handleOpenAssignment(assignment._id)}
                            >
                                <FaDownload />
                            </button>
                            <button
                                className={`bg-green-500 text-white px-2 py-1 rounded ${isAssignmentAttempted(assignment._id) || isAssignmentExpired(assignment.deadline) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                onClick={() => handleAttemptAssignment(assignment._id)}
                                disabled={isAssignmentAttempted(assignment._id) || isAssignmentExpired(assignment.deadline)}
                            >
                                Attempt
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Pagination
                assignmentsPerPage={assignmentsPerPage}
                totalAssignments={filteredAssignments.length}
                paginate={paginate}
            />
        </div>
    );
};

export default Assignment;
