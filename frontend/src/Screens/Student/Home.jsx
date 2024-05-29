import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux"

import Navbar from "../../components/Navbar";
import Profile from "./Profile";
import Timetable from "./Timetable";
import Marks from "./Marks";
import Notice from "../../components/Notice";
import Material from "./Material";
import Quiz from "./Quiz";
import Assignment from "./Assignment";

import { Toaster } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { PiStudentDuotone } from "react-icons/pi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { BiNotification } from "react-icons/bi";
import { MdQuiz } from "react-icons/md";
import { MdAssignmentAdd } from "react-icons/md";


const SidebarItem = ({ label, icon, onClick, selected }) => (
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
  const [selectedMenu, setSelectedMenu] = useState("My Profile");
  const router = useLocation();
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const quizInProgress = useSelector(state => state.isQuizInProgress);

  useEffect(() => {
    if (router.state === null) {
      navigate("/");
    }
    setLoad(true);
  }, [navigate, router.state]);

  const sidebarItems = [
    { label: "My Profile", icon: <CgProfile className="h-5 w-5" /> },
    { label: "Timetable", icon: <PiStudentDuotone className="h-5 w-5" /> },
    { label: "Quiz", icon: <MdQuiz className="h-5 w-5" /> },
    { label: "Assignment", icon: <MdAssignmentAdd className="h-5 w-5" /> },
    { label: "Marks", icon: <FaChalkboardTeacher className="h-5 w-5" /> },
    { label: "Material", icon: <BiNotification className="h-5 w-5" /> },
    { label: "Notice", icon: <BiNotification className="h-5 w-5" /> },
  ];

  const pageContent = {
    "My Profile": <Profile />,
    Timetable: <Timetable />,
    Quiz: <Quiz />,
    Assignment: <Assignment />,
    Marks: <Marks />,
    Material: <Material />,
    Notice: <Notice />,
  };

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
                {quizInProgress && sidebarItems.map((item) => (
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
              {pageContent[selectedMenu]}
            </div>
          </div>
        </>
      )}
      <Toaster position="bottom-center" />
    </section>
  );
};

export default Home;
