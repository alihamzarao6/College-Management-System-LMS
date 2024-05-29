import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { CgProfile } from "react-icons/cg";
import { FaChalkboardTeacher } from "react-icons/fa";
import { PiBooksLight, PiStudentDuotone } from "react-icons/pi";
import { BsFillPersonFill } from "react-icons/bs";
import { BiNotification } from "react-icons/bi";
import { MdAssignmentAdd } from "react-icons/md";
import { MdQuiz } from "react-icons/md";

import Navbar from "../../components/Navbar";
// import Notice from "../../components/Notice";
import Notice from "./Notice";
import Profile from "./Profile";
import Timetable from "./Timetable";
import Material from "./Material";
import Marks from "./Marks";
import Student from "./Student";
import Quiz from "./Quiz";
import Assignment from "./Assignment";

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
  const [selectedMenu, setSelectedMenu] = useState("My Profile");
  const [load, setLoad] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (router.state === null) {
      navigate("/");
    }
    setLoad(true);
  }, [navigate, router.state]);

  const sidebarItems = [
    {
      label: "My Profile",
      icon: <CgProfile className="h-5 w-5" />,
      component: <Profile />,
    },
    {
      label: "Student Info",
      icon: <PiStudentDuotone className="h-5 w-5" />,
      component: <Student />,
    },
    {
      label: "Quiz",
      icon: <MdQuiz className="h-5 w-5" />,
      component: <Quiz />,
    },
    {
      label: "Assignment",
      icon: <MdAssignmentAdd className="h-5 w-5" />,
      component: <Assignment />,
    },
    {
      label: "Upload Marks",
      icon: <FaChalkboardTeacher className="h-5 w-5" />,
      component: <Marks />,
    },
    {
      label: "Timetable",
      icon: <BsFillPersonFill className="h-5 w-5" />,
      component: <Timetable />,
    },
    {
      label: "Notice",
      icon: <BiNotification className="h-5 w-5" />,
      component: <Notice />,
    },
    {
      label: "Material",
      icon: <PiBooksLight className="h-5 w-5" />,
      component: <Material />,
    },
  ];

  return (
    <section>
      {load && (
        <>
          <Navbar />
          <div className="flex h-screen">
            {/* Sidebar */}
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

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {/* Hamburger menu for mobile */}
              <div className="md:hidden">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-xl focus:outline-none"
                >
                  ☰
                </button>
              </div>

              {/* Page content */}
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
    </section>
  );
};

export default Home;
