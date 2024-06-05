import React, { useEffect, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import axios from "axios";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../firebase/config";
import { baseApiURL } from "../../baseUrl";
import { FiSearch, FiUpload } from "react-icons/fi";

const Faculty = () => {
  const [file, setFile] = useState();
  const [selected, setSelected] = useState("add");
  const [department, setDepartment] = useState();
  const [data, setData] = useState({
    employeeId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    departments: [],
    gender: "",
    experience: "",
    post: "",
    profile: "",
    subjects: [],
    semesters: []
  });
  const [id, setId] = useState();
  const [allSubjects, setAllSubjects] = useState([]);
  const [allSemesters, setAllSemesters] = useState(['1', '2', '3', '4', '5', '6', '7', '8']);
  const [allDepartments, setAllDepartments] = useState([]);

  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [assignedSemesters, setAssignedSemesters] = useState([]);
  const [assignedDepartments, setAssignedDepartments] = useState([]);

  const [unassignedSubjects, setUnassignedSubjects] = useState([]);
  const [unassignedSemesters, setUnassignedSemesters] = useState([]);
  const [unassignedDepartments, setUnassignedDepartments] = useState([])

  const [search, setSearch] = useState();

  useEffect(() => {
    const uploadFileToStorage = async (file) => {
      toast.loading("Upload Photo To Storage");
      const storageRef = ref(
        storage,
        `Faculty Profile/${data.department}/${data.employeeId}`
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
            toast.success("Profile Uploaded To Faculty");
            setData({ ...data, profile: downloadURL });
          });
        }
      );
    };
    file && uploadFileToStorage(file);
  }, [data, file]);

  const addFacultyProfile = (e) => {
    e.preventDefault();
    toast.loading("Adding Faculty");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post(`${baseApiURL}/faculty/details/addDetails`, data, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          axios
            .post(
              `${baseApiURL}/faculty/auth/register`,
              { loginid: data.employeeId, password: 112233 },
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
                  employeeId: "",
                  firstName: "",
                  middleName: "",
                  lastName: "",
                  email: "",
                  phoneNumber: "",
                  departments: [],
                  gender: "",
                  experience: "",
                  post: "",
                  profile: "",
                  subjects: [],
                  semesters: []
                });
                setAllSubjects([]);
                setAllSemesters([]);
                setAllDepartments([]);
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

  const updateFacultyProfile = (e) => {
    e.preventDefault();
    toast.loading("Updating Faculty");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post(`${baseApiURL}/faculty/details/updateDetails/${id}`, data, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          setFile();
          setSearch();
          setId();
          setData({
            employeeId: "",
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            departments: [],
            gender: "",
            experience: "",
            post: "",
            profile: "",
            subjects: [],
            semesters: [],
          });
          setAllSubjects([]);
          setAllSemesters([]);
          setAllDepartments([]);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response.data.message);
      });
  };

  const searchFacultyHandler = (e) => {
    e.preventDefault();
    toast.loading("Getting Faculty");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post(
        `${baseApiURL}/faculty/details/getDetails`,
        { employeeId: search },
        { headers }
      )
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          if (response.data.user.length === 0) {
            toast.error("No Teacher Found with this employee Id!");
          } else {
            toast.success(response.data.message);
            setData({
              employeeId: response.data.user[0].employeeId,
              firstName: response.data.user[0].firstName,
              middleName: response.data.user[0].middleName,
              lastName: response.data.user[0].lastName,
              email: response.data.user[0].email,
              phoneNumber: response.data.user[0].phoneNumber,
              post: response.data.user[0].post,
              departments: response.data.user[0].departments,
              gender: response.data.user[0].gender,
              profile: response.data.user[0].profile,
              experience: response.data.user[0].experience,
              subjects: response.data.user[0].subjects,
              semesters: response.data.user[0].semesters,
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
      departments: [],
      gender: "",
      profile: "",
      subjects: [],
      semesters: [],
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
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseApiURL}/department/getDepartment`);
        // console.log(response.data.subject);
        if (response.data.success) {
          setAllDepartments(response.data.departments);
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
    const fetchTeacherSubjects = async () => {
      if (id) {
        try {
          const studentResponse = await axios.get(`${baseApiURL}/faculty/details/getDetails/${id}`);

          if (studentResponse.data.success) {
            const user = studentResponse.data.user;

            if (user && Array.isArray(user.subjects && user.semesters && user.departments)) {
              const studentSubjects = user.subjects;
              const studentDepartments = user.departments;
              const studentSemesters = user.semesters.map(String);

              setAssignedSubjects(studentSubjects);
              setAssignedSemesters(studentSemesters);
              setAssignedDepartments(studentDepartments);

              const unassignedSubjects = allSubjects.filter(subject => !studentSubjects.includes(subject._id));

              const unassignedDepartments = allDepartments.filter(department => !studentDepartments.includes(department._id));

              const unassignedSemesters = allSemesters.filter(semester => !studentSemesters.includes(semester));

              setUnassignedSubjects(unassignedSubjects);
              setUnassignedSemesters(unassignedSemesters);
              setUnassignedDepartments(unassignedDepartments);
            } else {
              toast.error("Data not found in the user response");
            }
          } else {
            toast.error(studentResponse.data.message);
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchTeacherSubjects();
  }, [id, allSubjects, allSemesters, allDepartments]);

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

  const handleDepartmentChange = (selectedDepartments) => {
    const departmentIds = selectedDepartments.map(department => department.value);
    const updatedAssignedDepartments = [...assignedDepartments, ...departmentIds];
    setData({ ...data, departments: updatedAssignedDepartments });
  };

  const handleRemoveDepartment = (removedDepartmentId) => {
    const updatedAssignedDepartments = assignedDepartments.filter(departmentId => departmentId !== removedDepartmentId);
    setAssignedDepartments(updatedAssignedDepartments);
    setData({ ...data, departments: updatedAssignedDepartments });
  };

  const handleSemesterChange = (selectedSemesters) => {
    const semesterIds = selectedSemesters.map(semester => semester.value);
    const updatedAssignedSemester = [...assignedSemesters, ...semesterIds];
    setData({ ...data, semesters: updatedAssignedSemester });
  };

  const handleRemoveSemester = (removedSemesterId) => {
    const updatedAssignedSemesters = assignedSubjects.filter(semesterId => semesterId !== removedSemesterId);
    setAssignedSemesters(updatedAssignedSemesters);
    setData({ ...data, semesters: updatedAssignedSemesters });
  };

  const removeSubject = (subjectId) => {
    setAssignedSubjects(assignedSubjects.filter(id => id !== subjectId));
  };

  return (
    <div className="w-[85%] mx-auto mt-7 flex justify-center items-start flex-col mb-10">
      <div className="flex justify-between items-center w-full">
        <Heading title="Faculty Details" />
        <div className="flex justify-end items-center w-full">
          <button
            className={`${selected === "add" && "border-b-2 "
              }border-blue-500 px-4 py-2 text-black rounded-sm mr-6`}
            onClick={() => setMenuHandler("add")}
          >
            Add Faculty
          </button>
          <button
            className={`${selected === "edit" && "border-b-2 "
              }border-blue-500 px-4 py-2 text-black rounded-sm`}
            onClick={() => setMenuHandler("edit")}
          >
            Edit Faculty
          </button>
        </div>
      </div>
      {selected === "add" && (
        <form
          onSubmit={addFacultyProfile}
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
            <label htmlFor="employeeId" className="leading-7 text-sm ">
              Enter Employee Id
            </label>
            <input
              type="number"
              id="employeeId"
              value={data.employeeId}
              onChange={(e) => setData({ ...data, employeeId: e.target.value })}
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

          <div className="w-[85%]">
            <label htmlFor="departments" className="leading-7 text-sm">
              Assign Departments
            </label>
            <Select
              id="departments"
              isMulti
              options={allDepartments.map(department => ({ value: department._id, label: department.name }))}
              onChange={selectedDepartments => handleDepartmentChange(selectedDepartments)}
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

          <div className="w-[85%]">
            <label htmlFor="subjects" className="leading-7 text-sm">
              Assign Subjects
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

          <div className="w-[85%]">
            <label htmlFor="semseters" className="leading-7 text-sm">
              Assign Semesters
            </label>
            <Select
              id="semseters"
              isMulti
              options={allSemesters.map(semester => ({ value: semester, label: `Semester ${semester}` }))}
              onChange={selectedSemesters => handleSemesterChange(selectedSemesters)}
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

          <div className="w-[95%] flex justify-evenly items-center">
            <div className="w-[40%]">
              <label htmlFor="post" className="leading-7 text-sm ">
                Enter POST
              </label>
              <input
                type="text"
                id="post"
                value={data.post}
                onChange={(e) => setData({ ...data, post: e.target.value })}
                className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
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
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="w-[95%] flex justify-evenly items-center">
            <div className="w-[40%]">
              <label htmlFor="experience" className="leading-7 text-sm ">
                Enter Experience
              </label>
              <input
                type="number"
                id="experience"
                value={data.experience}
                onChange={(e) =>
                  setData({ ...data, experience: e.target.value })
                }
                className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
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
          </div>

          <button
            type="submit"
            className="bg-blue-500 px-6 py-3 rounded-sm my-6 text-white"
          >
            Add New Faculty
          </button>
        </form>
      )}
      {selected === "edit" && (
        <div className="my-6 mx-auto w-full">
          <form
            className="flex justify-center items-center border-2 border-blue-500 rounded w-[40%] mx-auto"
            onSubmit={searchFacultyHandler}
          >
            <input
              type="text"
              className="px-6 py-3 w-full outline-none"
              placeholder="Employee Id."
              value={search || ""}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="px-4 text-2xl hover:text-blue-500">
              <FiSearch />
            </button>
          </form>
          {search && id && (
            <form
              onSubmit={updateFacultyProfile}
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
                <label htmlFor="employeeId" className="leading-7 text-sm ">
                  Enrollment No
                </label>
                <input
                  disabled
                  type="number"
                  id="employeeId"
                  value={data.employeeId}
                  onChange={(e) =>
                    setData({ ...data, employeeId: e.target.value })
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
                <label htmlFor="post" className="leading-7 text-sm ">
                  POST
                </label>
                <input
                  type="text"
                  id="post"
                  value={data.post}
                  onChange={(e) => setData({ ...data, post: e.target.value })}
                  className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
              </div>

              <div className="w-[85%]">
                <label htmlFor="assignedDepartments" className="leading-7 text-sm ">
                  Assigned Departments
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {assignedDepartments.map(departmentId => (
                    <div
                      key={departmentId}
                      className="bg-blue-200 rounded-full px-3 py-1 m-1 flex items-center text-sm"
                    >
                      {allDepartments.find(department => department._id === departmentId)?.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveDepartment(departmentId)}
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
                  Assign New Departments
                </label>
                <Select
                  id="unassignedSubjects"
                  isMulti
                  options={unassignedDepartments.map(department => ({ value: department._id, label: department.name }))}
                  onChange={handleDepartmentChange}
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
                  Assign New Subjects
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

              <div className="w-[85%]">
                <label htmlFor="assignedSemesters" className="leading-7 text-sm">
                  Assigned Semesters
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {assignedSemesters.map(semesterId => (
                    <div
                      key={semesterId}
                      className="bg-blue-200 rounded-full px-3 py-1 m-1 flex items-center text-sm"
                    >
                      {allSemesters.find(semester => semester === semesterId)}
                      <button
                        type="button"
                        onClick={() => handleRemoveSemester(semesterId)}
                        className="ml-2 text-red-600"
                      >
                        &#10005;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-[85%]">
                <label htmlFor="unassignedSemesters" className="leading-7 text-sm">
                  Assign New Semester
                </label>
                <Select
                  id="unassignedSemesters"
                  isMulti
                  options={unassignedSemesters.map(semester => ({ value: semester, label: `Semester ${semester}` }))}
                  onChange={handleSemesterChange}
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
                <label htmlFor="experience" className="leading-7 text-sm ">
                  Experience
                </label>
                <input
                  type="number"
                  id="experience"
                  value={data.experience}
                  onChange={(e) =>
                    setData({ ...data, experience: e.target.value })
                  }
                  className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                />
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
                Update Faculty
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Faculty;
