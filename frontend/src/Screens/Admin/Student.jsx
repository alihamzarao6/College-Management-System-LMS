import React, { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import axios from "axios";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../firebase/config";
import { baseApiURL } from "../../baseUrl";
import { FiSearch, FiUpload } from "react-icons/fi";


const Student = () => {
  const [file, setFile] = useState();
  const [selected, setSelected] = useState("add");
  const [department, setDepartment] = useState();
  const [search, setSearch] = useState();
  const [data, setData] = useState({
    enrollmentNo: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    semester: "",
    department: "",
    gender: "",
    profile: "",
    subjects: [],
  });

  const [id, setId] = useState();
  const [allSubjects, setAllSubjects] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [unassignedSubjects, setUnassignedSubjects] = useState([]);

  const getDepartmentData = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`${baseApiURL}/department/getDepartment`, { headers })
      .then((response) => {
        if (response.data.success) {
          setDepartment(response.data.departments);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    const uploadFileToStorage = async (file) => {
      toast.loading("Upload Photo To Storage");
      const storageRef = ref(
        storage,
        `Student Profile/${data.department}/${data.semester} Semester/${data.enrollmentNo}`
      );
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => { },
        (error) => {
          console.error(error);
          toast.dismiss();
          toast.error("Something Went Wrong!");
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            toast.dismiss();
            setFile();
            toast.success("Profile Uploaded To Storage");
            setData({ ...data, profile: downloadURL });
          });
        }
      );
    };
    file && uploadFileToStorage(file);
  }, [data, file]);

  useEffect(() => {
    getDepartmentData();
  }, []);

  const addStudentProfile = (e) => {
    e.preventDefault();
    toast.loading("Adding Student");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post(`${baseApiURL}/student/details/addDetails`, data, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          axios
            .post(
              `${baseApiURL}/student/auth/register`,
              { loginid: data.enrollmentNo, password: 112233 },
              {
                headers: headers,
              }
            )
            .then((response) => {
              toast.dismiss();
              if (response.data.success) {
                toast.success(response.data.message);
                setFile();
                setData({
                  enrollmentNo: "",
                  firstName: "",
                  middleName: "",
                  lastName: "",
                  email: "",
                  phoneNumber: "",
                  semester: "",
                  department: "",
                  gender: "",
                  profile: "",
                  subjects: []
                });
              } else {
                toast.error(response.data.message);
              }
            })
            .catch((error) => {
              toast.dismiss();
              toast.error(error.response.data.message);
            });
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response.data.message);
      });
  };

  const updateStudentProfile = (e) => {
    e.preventDefault();
    toast.loading("Updating Student");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post(`${baseApiURL}/student/details/updateDetails/${id}`, data, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          setFile("");
          setSearch("");
          setId("");
          setData({
            enrollmentNo: "",
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            semester: "",
            department: "",
            gender: "",
            profile: "",
            subjects: []
          });
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response.data.message);
      });
  };

  const searchStudentHandler = (e) => {
    e.preventDefault();
    toast.loading("Getting Student");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post(
        `${baseApiURL}/student/details/getDetails`,
        { enrollmentNo: search },
        { headers }
      )
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          if (response.data.user.length === 0) {
            toast.error("No Student Found with this enrollmentNo !");
          } else {
            toast.success(response.data.message);
            setData({
              enrollmentNo: response.data.user[0].enrollmentNo,
              firstName: response.data.user[0].firstName,
              middleName: response.data.user[0].middleName,
              lastName: response.data.user[0].lastName,
              email: response.data.user[0].email,
              phoneNumber: response.data.user[0].phoneNumber,
              semester: response.data.user[0].semester,
              department: response.data.user[0].department,
              gender: response.data.user[0].gender,
              profile: response.data.user[0].profile,
              subjects: response.data.user[0].subjects,
            });
            setId(response.data.user[0]._id);
          }
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
        console.error(error);
      });
  };

  const setMenuHandler = (type) => {
    setSelected(type);
    setFile("");
    setSearch("");
    setId("");
    setData({
      enrollmentNo: "",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      semester: "",
      department: "",
      gender: "",
      profile: "",
      subjects: []
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseApiURL}/subject/getSubject`);
        // console.log(response.data.subject);
        if (response.data.success) {
          setAllSubjects(response.data.subject);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error(error);
      }
    };

      fetchData();
  }, []);

  useEffect(() => {
    const fetchStudentSubjects = async () => {
      if (id) {
        try {
          const studentResponse = await axios.get(`${baseApiURL}/student/details/getDetails/${id}`);

          if (studentResponse.data.success) {
            const user = studentResponse.data.user;

            if (user && Array.isArray(user.subjects)) {
              const studentSubjects = user.subjects;
              setAssignedSubjects(studentSubjects);

              const unassignedSubjects = allSubjects.filter(subject => !studentSubjects.includes(subject._id));
              setUnassignedSubjects(unassignedSubjects);
            } else {
              toast.error("Subjects data not found in the user response");
            }
          } else {
            toast.error(studentResponse.data.message);
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchStudentSubjects();
  }, [id, allSubjects]);

  const handleSubjectChange = (selectedSubjects) => {
    const subjectIds = selectedSubjects.map(subject => subject.value);
    const updatedAssignedSubjects = [...assignedSubjects, ...subjectIds];
    setData({ ...data, subjects: updatedAssignedSubjects });
  };

  const handleRemoveSubject = (removedSubjectId) => {
    const updatedAssignedSubjects = assignedSubjects.filter(subjectId => subjectId !== removedSubjectId);
    setAssignedSubjects(updatedAssignedSubjects);
    setData({ ...data, subjects: updatedAssignedSubjects });
  };

  const removeSubject = (subjectId) => {
    setAssignedSubjects(assignedSubjects.filter(id => id !== subjectId));
  };

  return (
    <div className="w-[85%] mx-auto mt-7 flex justify-center items-start flex-col mb-10">
      <div className="flex justify-between items-center w-full">
        <Heading title="Student Details" />
        <div className="flex justify-end items-center w-full">
          <button
            className={`${selected === "add" && "border-b-2 "
              }border-blue-500 px-4 py-2 text-black rounded-sm mr-6`}
            onClick={() => setMenuHandler("add")}
          >
            Add Student
          </button>
          <button
            className={`${selected === "edit" && "border-b-2 "
              }border-blue-500 px-4 py-2 text-black rounded-sm`}
            onClick={() => setMenuHandler("edit")}
          >
            Edit Student
          </button>
        </div>
      </div>
      {selected === "add" && (
        <form
          onSubmit={addStudentProfile}
          className="w-[70%] flex justify-center items-center flex-wrap gap-6 mx-auto mt-10"
        >
          <div className="w-[40%]">
            <label htmlFor="firstname" className="leading-7 text-sm ">
              Enter First Name
            </label>
            <input
              type="text"
              id="firstname"
              value={data.firstName}
              onChange={(e) => setData({ ...data, firstName: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="middlename" className="leading-7 text-sm ">
              Enter Middle Name
            </label>
            <input
              type="text"
              id="middlename"
              value={data.middleName}
              onChange={(e) => setData({ ...data, middleName: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="lastname" className="leading-7 text-sm ">
              Enter Last Name
            </label>
            <input
              type="text"
              id="lastname"
              value={data.lastName}
              onChange={(e) => setData({ ...data, lastName: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="enrollmentNo" className="leading-7 text-sm ">
              Enter Enrollment No
            </label>
            <input
              type="number"
              id="enrollmentNo"
              value={data.enrollmentNo}
              onChange={(e) =>
                setData({ ...data, enrollmentNo: e.target.value })
              }
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="email" className="leading-7 text-sm ">
              Enter Email Address
            </label>
            <input
              type="email"
              id="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="phoneNumber" className="leading-7 text-sm ">
              Enter Phone Number
            </label>
            <input
              type="number"
              id="phoneNumber"
              value={data.phoneNumber}
              onChange={(e) =>
                setData({ ...data, phoneNumber: e.target.value })
              }
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="semester" className="leading-7 text-sm ">
              Select Semester
            </label>
            <select
              id="semester"
              className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
              value={data.semester}
              onChange={(e) => setData({ ...data, semester: e.target.value })}
            >
              <option defaultValue>-- Select --</option>
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
              <option value="3">3rd Semester</option>
              <option value="4">4th Semester</option>
              <option value="5">5th Semester</option>
              <option value="6">6th Semester</option>
              <option value="7">7th Semester</option>
              <option value="8">8th Semester</option>
            </select>
          </div>
          <div className="w-[40%]">
            <label htmlFor="department" className="leading-7 text-sm ">
              Select Department
            </label>
            <select
              id="department"
              className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
              value={data.department}
              onChange={(e) => setData({ ...data, department: e.target.value })}
            >
              <option defaultValue>-- Select --</option>
              {department?.map((department) => {
                return (
                  <option value={department.name} key={department.name}>
                    {department.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="w-[85%]">
            <label htmlFor="subjects" className="leading-7 text-sm">
              Select Subjects
            </label>
            <Select
              id="subjects"
              isMulti
              options={allSubjects.map(subject => ({ value: subject._id, label: subject.name }))}
              onChange={selectedSubjects => handleSubjectChange(selectedSubjects)}
              styles={{
                control: provided => ({
                  ...provided,
                  backgroundColor: '#edf2f7',
                  borderRadius: '.375rem',
                  borderColor: '#cbd5e0',
                  minHeight: '3rem',
                }),
                singleValue: provided => ({
                  ...provided,
                  color: '#2d3748',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#4299e1' : 'white',
                  color: state.isSelected ? 'white' : '#2d3748',
                  ':hover': {
                    backgroundColor: '#63b3ed',
                  },
                }),
              }}
            />
          </div>
          <div className="w-[40%]">
            <label htmlFor="gender" className="leading-7 text-sm ">
              Select Gender
            </label>
            <select
              id="gender"
              className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
              value={data.gender}
              onChange={(e) => setData({ ...data, gender: e.target.value })}
            >
              <option defaultValue>-- Select --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="w-[40%]">
            <label htmlFor="file" className="leading-7 text-sm ">
              Select Profile
            </label>
            <label
              htmlFor="file"
              className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full flex justify-center items-center cursor-pointer"
            >
              Upload
              <span className="ml-2">
                <FiUpload />
              </span>
            </label>
            <input
              hidden
              type="file"
              id="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 px-6 py-3 rounded-sm mb-6 text-white"
          >
            Add New Student
          </button>
        </form>
      )}
      {selected === "edit" && (
        <div className="my-6 mx-auto w-full">
          <form
            className="flex justify-center items-center border-2 border-blue-500 rounded w-[40%] mx-auto"
            onSubmit={searchStudentHandler}
          >
            <input
              type="text"
              className="px-6 py-3 w-full outline-none"
              placeholder="Enrollment No."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="px-4 text-2xl hover:text-blue-500" type="submit">
              <FiSearch />
            </button>
          </form>
          {search && id && (
            <form
              onSubmit={updateStudentProfile}
              className="w-[70%] flex justify-center items-center flex-wrap gap-6 mx-auto mt-10"
            >
              <div className="w-[40%]">
                <label htmlFor="firstname" className="leading-7 text-sm ">
                  Enter First Name
                </label>
                <input
                  type="text"
                  id="firstname"
                  value={data.firstName}
                  onChange={(e) =>
                    setData({ ...data, firstName: e.target.value })
                  }
                  className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>
              <div className="w-[40%]">
                <label htmlFor="middlename" className="leading-7 text-sm ">
                  Enter Middle Name
                </label>
                <input
                  type="text"
                  id="middlename"
                  value={data.middleName}
                  onChange={(e) =>
                    setData({ ...data, middleName: e.target.value })
                  }
                  className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>
              <div className="w-[40%]">
                <label htmlFor="lastname" className="leading-7 text-sm ">
                  Enter Last Name
                </label>
                <input
                  type="text"
                  id="lastname"
                  value={data.lastName}
                  onChange={(e) =>
                    setData({ ...data, lastName: e.target.value })
                  }
                  className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>
              <div className="w-[40%]">
                <label htmlFor="enrollmentNo" className="leading-7 text-sm ">
                  Enrollment No
                </label>
                <input
                  disabled
                  type="number"
                  id="enrollmentNo"
                  value={data.enrollmentNo}
                  onChange={(e) =>
                    setData({ ...data, enrollmentNo: e.target.value })
                  }
                  className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>
              <div className="w-[40%]">
                <label htmlFor="email" className="leading-7 text-sm ">
                  Enter Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>
              <div className="w-[40%]">
                <label htmlFor="phoneNumber" className="leading-7 text-sm ">
                  Enter Phone Number
                </label>
                <input
                  type="number"
                  id="phoneNumber"
                  value={data.phoneNumber}
                  onChange={(e) =>
                    setData({ ...data, phoneNumber: e.target.value })
                  }
                  className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>
              <div className="w-[40%]">
                <label htmlFor="semester" className="leading-7 text-sm ">
                  Semester
                </label>
                <select
                  id="semester"
                  className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                  value={data.semester}
                  onChange={(e) =>
                    setData({ ...data, semester: e.target.value })
                  }
                >
                  <option defaultValue>-- Select --</option>
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                  <option value="3">3rd Semester</option>
                  <option value="4">4th Semester</option>
                  <option value="5">5th Semester</option>
                  <option value="6">6th Semester</option>
                  <option value="7">7th Semester</option>
                  <option value="8">8th Semester</option>
                </select>
              </div>
              <div className="w-[40%]">
                <label htmlFor="department" className="leading-7 text-sm ">
                  Department
                </label>
                <select
                  id="department"
                  className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                  value={data.department}
                  onChange={(e) => setData({ ...data, department: e.target.value })}
                >
                  <option defaultValue>-- Select --</option>
                  {department?.map((department) => {
                    return (
                      <option value={department.name} key={department.name}>
                        {department.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="w-[85%]">
                <label htmlFor="assignedSubjects" className="leading-7 text-sm">
                  Assigned Subjects
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {assignedSubjects.map(subjectId => (
                    <div
                      key={subjectId}
                      className="bg-blue-200 rounded-full px-3 py-1 m-1 flex items-center text-sm"
                    >
                      {allSubjects.find(subject => subject._id === subjectId)?.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subjectId)}
                        className="ml-2 text-red-600"
                      >
                        &#10005;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-[85%]">
                <label htmlFor="unassignedSubjects" className="leading-7 text-sm">
                  Select New Subjects
                </label>
                <Select
                  id="unassignedSubjects"
                  isMulti
                  options={unassignedSubjects.map(subject => ({ value: subject._id, label: subject.name }))}
                  onChange={handleSubjectChange}
                  styles={{
                    control: provided => ({
                      ...provided,
                      backgroundColor: '#edf2f7',
                      borderRadius: '.375rem',
                      borderColor: '#cbd5e0',
                      minHeight: '3rem',
                    }),
                    singleValue: provided => ({
                      ...provided,
                      color: '#2d3748',
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? '#4299e1' : 'white',
                      color: state.isSelected ? 'white' : '#2d3748',
                      ':hover': {
                        backgroundColor: '#63b3ed',
                      },
                    }),
                  }}
                />
              </div>

              <div className="w-[40%]">
                <label htmlFor="gender" className="leading-7 text-sm ">
                  Select Gender
                </label>
                <select
                  id="gender"
                  className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full accent-blue-700 mt-1"
                  value={data.gender}
                  onChange={(e) => setData({ ...data, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="w-[40%]">
                <label htmlFor="file" className="leading-7 text-sm ">
                  Select New Profile
                </label>
                <label
                  htmlFor="file"
                  className="px-2 bg-blue-50 py-3 rounded-sm text-base w-full flex justify-center items-center cursor-pointer"
                >
                  Upload
                  <span className="ml-2">
                    <FiUpload />
                  </span>
                </label>
                <input
                  hidden
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 px-6 py-3 rounded-sm mb-6 text-white"
              >
                Update Student
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Student;
