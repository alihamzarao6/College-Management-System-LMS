import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../firebase/config';

import Heading from '../../components/Heading';
import Assignment from './Assignment';

const UploadAssignment = ({ assignmentId }) => {
    const jwtToken = useSelector((state) => state.jwtToken);

    const [selectedFile, setSelectedFile] = useState(null);
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [downloadURL, setDownloadURL] = useState('');
    const [backToAssignment, setBackToAssignment] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            setIsFileUploaded(false);
        } else {
            toast.error('Please select a valid PDF file.');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file.');
            return;
        }
        
        if (isLoading) {
            return;
        }

        try {
            const storagePath = `assignments/${assignmentId}/${selectedFile.name}`;
            const storageRef = ref(storage, storagePath);
            const uploadTask = uploadBytesResumable(storageRef, selectedFile);

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
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setDownloadURL(downloadURL);
                    setIsFileUploaded(true);
                    toast.success('File uploaded successfully!');
                }
            );
        } catch (error) {
            console.error('Error during file upload:', error);
            toast.error('Error during file upload. Please try again.');
        } finally {
            // Set isUploading back to false after the upload process
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!isFileUploaded) {
            toast.error('Please upload a file before submitting.');
            return;
        }

        try {
            const data = {
                assignmentId,
                fileUrl: downloadURL
            }

            const response = await axios.post(
                'http://localhost:5000/api/assignment/submit',
                data,
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                }
            );

            toast.success(response.data.message);
            setBackToAssignment(true)
        } catch (error) {
            console.error(error);
            toast.error('Error submitting assignment. Please try again.');
        }
    };

    const handleBackToAssignments = () => {
        setBackToAssignment(true);
    }

    if (backToAssignment) {
        return <Assignment />
    }

    return (
        <div>
            <Heading title="Upload Assignment" />
            <input type="file" accept=".pdf" onChange={handleFileChange} />
            <button
                className={`bg-green-500 text-white px-2 md:px-4 py-1 md:py-2 rounded mt-2 md:mt-4 mr-2 ${
                    isLoading || isFileUploaded
                    ? 'disabled'
                    : ''}`}
                onClick={handleUpload}
            >
                Upload File
            </button>
            <button
                className={`bg-blue-500 text-white px-2 md:px-4 py-1 md:py-2 rounded mt-2 md:mt-4 mr-2 ${isLoading ? 'disabled' : ''}`}
                onClick={handleBackToAssignments}
            >
                Back to Assignments
            </button>
            
            {uploadProgress > 0 && (
                <div className="mt-4">
                    <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>
                </div>
            )}

            {isFileUploaded && (
                <div>
                    <p>File uploaded successfully!</p>
                    <button
                        className="bg-blue-500 text-white px-2 md:px-4 py-1 md:py-2 rounded mt-2 md:mt-4 mr-2"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                </div>
            )}
        </div>
    );
};

export default UploadAssignment;
