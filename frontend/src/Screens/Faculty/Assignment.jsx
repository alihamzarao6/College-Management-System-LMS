import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';

import { getTeacherAssignments } from '../../redux/actions';
import Heading from '../../components/Heading';
import CreateAssignment from './CreateAssignment';
import AssignmentResultPage from './AssignmentResultPage';

const Assignment = () => {
    const dispatch = useDispatch();

    const jwtToken = useSelector((state) => state.jwtToken);
    const assignments = useSelector((state) => state.assignments);

    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const [availableDepartments, setAvailableDepartments] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);

    const [createAssignmentClicked, setCreateAssignmentClicked] = useState(false);
    const [openResultPage, setOpenResultPage] = useState(false);
    const [assignmentId, setAssignmentId] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [assignmentsPerPage] = useState(6);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
        dispatch(getTeacherAssignments(assignments));
    }, [dispatch, assignments]);

    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/assignment/teacher`, {
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

                dispatch(getTeacherAssignments(fetchedAssignments));
            })
            .catch((error) => {
                console.error(error);
                toast.error(error.message);
            });
    }, [dispatch, jwtToken]);

    const handleCreateAssignment = () => {
        setCreateAssignmentClicked(true);
    };

    if (createAssignmentClicked) {
        return <CreateAssignment />;
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

    const filteredAssignments = assignments.filter((assignment) => {
            return (
                (!selectedDepartment || assignment.department === selectedDepartment) &&
                (!selectedSemester || assignment.semester.toString() === selectedSemester) &&
                (!selectedSubject || assignment.subject === selectedSubject)
            );
        })

    const indexOfLastAssignment = currentPage * assignmentsPerPage;
    const indexOfFirstAssignment = indexOfLastAssignment - assignmentsPerPage;
    const currentAssignments = filteredAssignments.slice(indexOfFirstAssignment, indexOfLastAssignment);

    const handleOpenAssignment = async (assignmentId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/assignment/assignments/${assignmentId}`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            const assignmentData = response.data.assignment;
            const fileUrl = assignmentData.file;

            window.open(fileUrl, '_blank')
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    const handleOpenResults = (assignmentId) => {
        setAssignmentId(assignmentId);
        setOpenResultPage(true);
    }
    
    if(openResultPage) {
        return <AssignmentResultPage assignmentId={assignmentId} />
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
            <Heading title={`Assignments`} />

            <div className="mt-5 font-semibold gap-1">
                <p>Filter Your Created Assignments:</p>
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
                    onClick={handleCreateAssignment}
                >
                    Create a New Assignment
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {currentAssignments.map((assignment) => (
                    <div key={assignment._id} className="border p-4 px-3 my-4">
                        <div>
                            <p>{`Title: ${assignment?.title}`}</p>
                            <p>{`Semester: ${assignment?.semester}`}<span className="ml-4">{`Subject: ${assignment?.subject}`}</span></p>
                            <p>{`Deadline: ${new Date(assignment?.deadline).toLocaleString()}`}</p>
                            <p>{`Marks: ${assignment?.totalMarks}`}</p>
                        </div>

                        <div className="flex justify-end mt-2">
                            <button
                                className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                                onClick={() => handleOpenAssignment(assignment._id)}
                            >
                                Open
                            </button>
                            <button
                                className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                                onClick={() => handleOpenResults(assignment._id)}
                            >
                                Results
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
