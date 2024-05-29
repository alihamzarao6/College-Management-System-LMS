import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { toast, Toaster } from "react-hot-toast";
import { CgProfile } from "react-icons/cg";
import { PiBooksLight, PiStudentDuotone } from "react-icons/pi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { BsFillBuildingsFill } from "react-icons/bs";
import { RiAdminLine } from "react-icons/ri";
import axios from "axios";
import Notice from "../../components/Notice";
import Student from "./Student";
import Faculty from "./Faculty";
import Subjects from "./Subject";
import { baseApiURL } from "../../baseUrl";
import Admin from "./Admin";
import Profile from "./Profile";
import Department from "./Department";
import { BiNotification } from "react-icons/bi";

const SidebarItem = ({ icon, label, onClick, selected }) => (
  <li
    className={`flex items-center cursor-pointer py-3 px-4 ${selected ? "bg-blue-100 text-blue-500" : "hover:bg-gray-300"
      } ${!selected && "md:hover:bg-gray-300 md:text-lg"}`}
    onClick={onClick}
  >
    {icon && <span className="mr-2">{icon}</span>}
    <span className={`${selected ? "md:text-lg" : ""}`}>{label}</span>
  </li>
);

const Home = () => {
  const router = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("Profile");
  const [dashboardData, setDashboardData] = useState({
    studentCount: "",
    facultyCount: "",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (router.state === null) {
      navigate("/");
    }
    setLoad(true);
  }, [navigate, router.state]);

  useEffect(() => {
    getStudentCount();
    getFacultyCount();
  }, []);

  const getStudentCount = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`${baseApiURL()}/student/details/count`, {
        headers: headers,
      })
      .then((response) => {
        if (response.data.success) {
          setDashboardData({
            ...dashboardData,
            studentCount: response.data.user,
          });
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getFacultyCount = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .get(`${baseApiURL()}/faculty/details/count`, {
        headers: headers,
      })
      .then((response) => {
        if (response.data.success) {
          setDashboardData({
            ...dashboardData,
            facultyCount: response.data.user,
          });
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const sidebarItems = [
    {
      label: "Profile",
      icon: <CgProfile className="h-5 w-5" />,
      component: <Profile />,
    },
    {
      label: "Student",
      icon: <PiStudentDuotone className="h-5 w-5" />,
      component: <Student />,
    },
    {
      label: "Faculty",
      icon: <FaChalkboardTeacher className="h-5 w-5" />,
      component: <Faculty />,
    },
    {
      label: "Department",
      icon: <BsFillBuildingsFill className="h-5 w-5" />,
      component: <Department />,
    },
    {
      label: "Notice",
      icon: <BiNotification className="h-5 w-5" />,
      component: <Notice />,
    },
    {
      label: "Subjects",
      icon: <PiBooksLight className="h-5 w-5" />,
      component: <Subjects />,
    },
    {
      label: "Admin",
      icon: <RiAdminLine className="h-5 w-5" />,
      component: <Admin />,
    },
  ];

  return (
    <>
      {load && (
        <>
          <Navbar />
          <div className="flex h-screen">
            <div
              className={`${sidebarOpen ? "w-1/2 md:w-1/5" : "hidden md:w-1/5"
                } transition-all ease-linear duration-300 bg-gray-200 overflow-hidden md:block sticky top-0 h-screen`}
            >
              <ul className="py-4">
                {sidebarItems.map((item) => (
                  <SidebarItem
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    onClick={() => {
                      setSelectedMenu(item.label);
                      setSidebarOpen(false);
                    }}
                    selected={selectedMenu === item.label}
                  />
                ))}
              </ul>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="md:hidden">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-xl focus:outline-none"
                >
                  ☰
                </button>
              </div>

              <>
                {sidebarItems.map((item) => (
                  <React.Fragment key={item.label}>
                    {selectedMenu === item.label && item.component}
                  </React.Fragment>
                ))}
              </>
            </div>
          </div>
        </>
      )}
      <Toaster position="bottom-center" />
    </>
  );
};

export default Home;
