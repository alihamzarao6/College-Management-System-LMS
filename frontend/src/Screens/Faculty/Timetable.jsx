import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiUpload } from "react-icons/fi";
import Heading from "../../components/Heading";
import { AiOutlineClose } from "react-icons/ai";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import { storage } from "../../firebase/config";
import { baseApiURL } from "../../baseUrl";
import { useSelector } from "react-redux";

const Timetable = () => {
  const userInfo = useSelector((state) => state.userInfo);

  const [addselected, setAddSelected] = useState({
    department: "",
    semester: "",
    link: "",
    fileType: "",
  });
  const [file, setFile] = useState();
  const [department, setDepartment] = useState();
  const [semesters, setSemesters] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getDepartmentData();
    getSemesterData();
  }, []);

  useEffect(() => {
    const uploadFileToStorage = async (file) => {
      setUploading(true);
      toast.loading("Upload Timetable To Server");

      const storageRef = ref(
        storage,
        `Timetable/${addselected.department}/Semester ${addselected.semester}`
      );

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => { },
        (error) => {
          console.error(error);
          toast.dismiss();
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              toast.dismiss();
              toast.success("Timetable Uploaded To Server");

              const fileType = file.name.split(".").pop().toLowerCase();
              setAddSelected({ ...addselected, link: downloadURL, fileType });
              setUploading(false);
            })
            .catch((error) => {
              console.error("Error getting download URL:", error);
              toast.dismiss();
            });
        }
      );
    };

    if (file) {
      uploadFileToStorage(file);
    }
  }, [file]);


  const getDepartmentData = () => {
    const headers = {
      "Content-Type": "application/json",
    };
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
        setDepartment(departmentNames);

      })
      .catch((error) =>
        console.error('Error fetching departments:', error)
      );
  };

  const getSemesterData = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    
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
  };

  const addTimetableHandler = () => {
    toast.loading("Adding Timetable");
    setUploading(true);
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post(`${baseApiURL}/timetable/addTimetable`, addselected, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          setAddSelected({
            department: "",
            semester: "",
            link: "",
            fileType: "",
          });
          setFile("");
          setUploading(false);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response.data.message);
      });
  };
  return (
    <div className="w-[85%] mx-auto mt-7 flex justify-center items-start flex-col mb-10">
      <div className="flex justify-between items-center w-full">
        <Heading title={`Upload Timetable`} />
      </div>
      <div className="w-full flex justify-evenly items-center mt-12">
        <div className="w-1/2 flex flex-col justify-center items-center">
          <p className="mb-4 text-xl font-medium">Add Timetable</p>
          <select
            id="department"
            className="px-2 bg-blue-50 py-3 rounded-sm text-base w-[80%] accent-blue-700 mt-4"
            value={addselected.department}
            onChange={(e) =>
              setAddSelected({ ...addselected, department: e.target.value })
            }
          >
            <option defaultValue>-- Select Department --</option>
            {department &&
              department.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
          </select>
          <select
            onChange={(e) =>
              setAddSelected({ ...addselected, semester: e.target.value })
            }
            value={addselected.semester}
            name="department"
            id="department"
            className="px-2 bg-blue-50 py-3 rounded-sm text-base w-[80%] accent-blue-700 mt-4"
          >
            <option value="">-- Select --</option>
            {semesters.map((semester, index) => (
              <option key={index} value={semester}>
                {`${semester} Semester`}
              </option>
            ))}
          </select>
          {!addselected.link && (
            <label
              htmlFor="upload"
              className="px-2 bg-blue-50 py-3 rounded-sm text-base w-[80%] mt-4 flex justify-center items-center cursor-pointer"
            >
              Upload Timetable
              <span className="ml-2">
                <FiUpload />
              </span>
            </label>
          )}
          {addselected.link && (
            <p
              className="px-2 border-2 border-blue-500 py-2 rounded text-base w-[80%] mt-4 flex justify-center items-center cursor-pointer"
              onClick={() => setAddSelected({ ...addselected, link: "" })}
            >
              Remove Selected Timetable
              <span className="ml-2">
                <AiOutlineClose />
              </span>
            </p>
          )}
          <input
            type="file"
            name="upload"
            id="upload"
            accept=".pdf, .jpg, .jpeg, .png"
            hidden
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button
            className="bg-blue-500 text-white mt-8 px-4 py-2 rounded-sm"
            onClick={addTimetableHandler}
            disabled={uploading}
          >
            Add Timetable
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
