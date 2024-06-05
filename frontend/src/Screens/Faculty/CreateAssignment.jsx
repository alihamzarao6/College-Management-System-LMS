import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../firebase/config';

import Heading from '../../components/Heading';
import Assignment from './Assignment';
import { baseApiURL } from '../../baseUrl';

const CreateAssignment = () => {
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [marks, setMarks] = useState('');
    const [deadline, setDeadline] = useState('');
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const jwtToken = useSelector((state) => state.jwtToken);
    const userInfo = useSelector((state) => state.userInfo);

    const [redirectToAssignment, setRedirectToAssignment] = useState(false);

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

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        } else {
            toast.error('Please select a valid PDF file.');
        }
    };

    const handleCreateAssignment = async () => {
        try {
            if (isLoading) {
                return;
            }

            setIsLoading(true);

            if (!selectedDepartment || !selectedSemester || !selectedSubject || !marks || !deadline || !file || !title) {
                toast.error('Please fill in all the required fields.');
                return;
            }

            const storagePath = `assignments/${file.name}`;
            const storageRef = ref(storage, storagePath);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error(error);
                    toast.error('Error during file upload. Please try again.');
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                        const response = await axios.post(
                            '${baseApiURL}/assignment/create',
                            {
                                semester: selectedSemester,
                                subject: selectedSubject,
                                department: selectedDepartment,
                                deadline,
                                marks,
                                fileUrl: downloadURL,
                                title,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${jwtToken}`,
                                },
                            }
                        );

                        // Reset the form
                        setSelectedDepartment('');
                        setSelectedSemester('');
                        setSelectedSubject('');
                        setMarks('');
                        setDeadline('');
                        setFile(null);
                        setTitle('');

                        toast.success('Assignment created successfully!');
                        setIsSubmitted(true);
                    } catch (error) {
                        console.error('Error creating assignment:', error);
                        toast.error('Error creating assignment. Please try again.');
                    } finally {
                        // Set isLoading back to false after the assignment creation process
                        setIsLoading(false);
                    }
                }
            );
        } catch (error) {
            console.error('Error during file upload:', error);
            toast.error('Error during file upload. Please try again.');
        }
    };

    if (isSubmitted) {
        return <Assignment />
    };

    const handleBackToAssignment = () => {
        setRedirectToAssignment(true);
    }

    if (redirectToAssignment) {
        return <Assignment />
    }

    return (
        <div className="w-[85%] mx-auto flex justify-center items-start flex-col my-10 mt-7">
            <Heading title={`Create Assignment`} />


            <div className="relative flex flex-col lg:flex-row justify-between items-center w-full gap-1">
                <div className="mt-4 w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="department" className="leading-7 text-base">
                        Select Department
                    </label>
                    <select
                        id="department"
                        className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        {departments.map((department) => (
                            <option key={department} value={department}>
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
                        {semesters.map((semester) => (
                            <option key={semester} value={semester}>
                                {semester}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-4 w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="subject" className="leading-7 text-base">
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
                    <label htmlFor="marks" className="leading-7 text-base">
                        Marks
                    </label>
                    <input
                        id="marks"
                        type="text"
                        className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                    />
                </div>
            </div>

            <div className="relative flex flex-col lg:flex-row items-center w-full gap-1 mt-4">
                <div className="w-full sm:w-1/2 lg:w-1/4">
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

                <div className="w-full sm:w-1/2 lg:w-1/4">
                    <label htmlFor="title" className="leading-7 text-base">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
            </div>


            {/* File Upload */}
            <div className="mt-6 w-full">
                <label htmlFor="file" className="leading-7 text-base">
                    Upload Assignment File
                </label>
                <input type="file" id="file" accept='.pdf' onChange={handleFileChange} />
            </div>

            {uploadProgress > 0 && (
                <div className="mt-4">
                    <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>
                </div>
            )}

            <div className="flex mt-4">
                <button
                    className={`bg-blue-500 px-4 py-2 mr-2 rounded border-2 border-blue-500 text-white ${!selectedDepartment ||
                        !selectedSemester ||
                        !selectedSubject ||
                        !marks ||
                        !deadline ||
                        !file ||
                        !title ||
                        isLoading
                        ? 'disabled'
                        : ''}`}
                    onClick={handleCreateAssignment}
                    disabled={isLoading || !selectedDepartment || !selectedSemester || !selectedSubject || !marks || !deadline || !file}
                >
                    {isLoading ? 'Loading...' : 'Create Assignment'}
                </button>

                <button
                    className={`bg-blue-500 px-4 py-2 mr-2 rounded border-2 border-blue-500 text-white ${isLoading ? 'disabled' : ''}`}
                    onClick={handleBackToAssignment}
                >
                    Back To Assignment
                </button>
            </div>
        </div>
    );
};

export default CreateAssignment;
