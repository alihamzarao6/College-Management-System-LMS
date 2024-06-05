import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaPencilAlt, FaCheck } from 'react-icons/fa';

import Assignment from "./Assignment";
import { baseApiURL } from '../../baseUrl';

const AssignmentResultPage = ({ assignmentId }) => {
    const [assignmentResult, setAssignmentResult] = useState(null);
    const [backToAssignment, setBackToAssignment] = useState(false);

    const [editableMarks, setEditableMarks] = useState({ studentId: '', marks: 0, enrollmentNo: '' });

    const jwtToken = useSelector((state) => state.jwtToken);


    useEffect(() => {
        const fetchAssignmentResult = async () => {
            try {
                const response = await axios.get(`${baseApiURL}/assignment/result/teacher/${assignmentId}`, {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                });
                setAssignmentResult(response.data.result);

            } catch (error) {
                console.error('Error fetching assignment result:', error);
            }
        };

        fetchAssignmentResult();
    }, [assignmentId, jwtToken]);

    const handleMarkChange = async (studentId, enrollmentNo, newMarks) => {
        try {
            await axios.post(
                `${baseApiURL}/assignment/grade`,
                {
                    assignmentId,
                    studentId,
                    enrollmentNo,
                    marks: newMarks,
                },
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                }
            );

            const updatedResult = await axios.get(`${baseApiURL}/assignment/result/teacher/${assignmentId}`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            setAssignmentResult(updatedResult.data.result);
        } catch (error) {
            console.error('Error updating marks:', error);
        }
    };


    const handleEditMark = (studentId, enrollmentNo, currentMarks) => {
        setEditableMarks({ studentId, enrollmentNo, marks: currentMarks });
    };

    const handleSaveEdit = () => {
        handleMarkChange(editableMarks.studentId, editableMarks.enrollmentNo, editableMarks.marks);
        setEditableMarks({ studentId: '', enrollmentNo: '', marks: 0 });
    };

    const handleCancelEdit = () => {
        setEditableMarks({ studentId: '', enrollmentNo: '', marks: 0 });
    };

    if (!assignmentResult) {
        return <div>Loading...</div>;
    }

    const handleBacktoAssignment = () => {
        setBackToAssignment(true);
    }

    if (backToAssignment) {
        return <Assignment />
    }

    return (
        <div className="container mx-auto my-8">
            <h1 className="text-3xl font-semibold mb-6">Assignment Result</h1>
            <div className="mb-4">
                <p>
                    <strong>Title:</strong> {assignmentResult?.assignment.title}
                </p>
                <p>
                    <strong>Semester:</strong> {assignmentResult?.assignment.semester}
                </p>
                <p>
                    <strong>Subject:</strong> {assignmentResult?.assignment.subject}
                </p>
                <p>
                    <strong>Department:</strong> {assignmentResult?.assignment.department}
                </p>
                <p>
                    <strong>Deadline:</strong>{' '}
                    {new Date(assignmentResult?.assignment.deadline).toLocaleString()}
                </p>
                <p>
                    <strong>Total Marks:</strong> {assignmentResult?.assignment.totalMarks}
                </p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-2 border">Enrollment No</th>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Attempted</th>
                            <th className="p-2 border">File</th>
                            <th className="p-2 border">Marks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignmentResult.studentsSupposedToAttempt.map((student) => (
                            <tr key={student.studentId}>
                                <td className="p-2 border text-center">{student.enrollmentNo}</td>
                                <td className="p-2 border text-center">{`${student.firstName} ${student.lastName}`}</td>
                                <td className="p-2 border text-center">{student.completed ? 'Yes' : 'No'}</td>
                                <td className="p-2 border text-center">
                                    {student.fileUrl ? (
                                        <a className="bg-blue-500 text-white px-2 py-1 rounded ml-auto" href={student.fileUrl} target="_blank" rel="noopener noreferrer">
                                            View File
                                        </a>
                                    ) : (
                                        'No file'
                                    )}
                                </td>
                                <td className="p-2 border text-center">
                                    <div className="flex items-center justify-center">
                                        {editableMarks.studentId === student.studentId ? (
                                            <>
                                                <input
                                                    className="border border-gray-900 px-2 py-1 mr-2 w-16 sm:w-24 md:w-32 lg:w-40 xl:w-48"
                                                    type="number"
                                                    value={editableMarks.marks}
                                                    onChange={(e) =>
                                                        setEditableMarks((prev) => ({ ...prev, marks: e.target.value }))
                                                    }
                                                />
                                                <FaCheck
                                                    className="text-green-500 cursor-pointer"
                                                    onClick={handleSaveEdit}
                                                />
                                                <FaPencilAlt
                                                    className="ml-2 text-blue-500 cursor-pointer"
                                                    onClick={() => handleCancelEdit()}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                {student.marks !== undefined && student.marks !== 0 ? (
                                                    <>
                                                        {student.marks}
                                                        <FaPencilAlt
                                                            className="ml-2 text-blue-500 cursor-pointer"
                                                            onClick={() => handleEditMark(student.studentId, student.enrollmentNo, student.marks)}
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <input
                                                            className="border px-2 py-1 mr-2"
                                                            type="number"
                                                            value={editableMarks.marks}
                                                            onChange={(e) =>
                                                                setEditableMarks((prev) => ({ ...prev, marks: e.target.value }))
                                                            }
                                                        />
                                                        <FaCheck
                                                            className="text-green-500 cursor-pointer"
                                                            onClick={() => handleMarkChange(student.studentId, student.enrollmentNo, editableMarks.marks)}
                                                        />
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button
                className="bg-blue-500 text-white px-4 py-2 rounded mt-4 ml-auto"
                onClick={handleBacktoAssignment}
            >
                Back to Assignment
            </button>
        </div>
    );
};

export default AssignmentResultPage;
