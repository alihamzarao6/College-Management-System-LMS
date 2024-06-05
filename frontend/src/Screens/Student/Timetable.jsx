import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import Heading from "../../components/Heading";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { baseApiURL } from "../../baseUrl";

const Timetable = () => {
  const [timetable, setTimetable] = useState("");
  const [fileType, setFileType] = useState("");
  const userInfo = useSelector((state) => state.userInfo.userDetails);

  useEffect(() => {
    const getTimetable = () => {
      const headers = {
        "Content-Type": "application/json",
      };
      axios
        .post(
          `${baseApiURL}/timetable/getTimetable`,
          { semester: userInfo.semester, department: userInfo.department },
          {
            headers: headers,
          }
        )
        .then((response) => {
          if (response.data && response.data.length > 0) {
            setTimetable(response.data[0].link);
            setFileType(response.data[0].fileType);
          } else {
            console.log("Timetable data is empty:", response.data);
          }
        })
        .catch((error) => {
          toast.dismiss();
          console.error(error.response.data.message);
        });
    };
    userInfo && getTimetable();
  }, [userInfo, userInfo?.department, userInfo?.semester]);

  return (
    <div className="w-full mx-auto mt-10 flex justify-center items-start flex-col mb-10 p-4">
      <div className="flex flex-col items-center">
        <Heading title={`Timetable of Semester ${userInfo?.semester}`} />
        <p
          className="text-lg font-medium cursor-pointer mt-4 text-blue-500 hover:text-red-500 transition-all duration-200 ease-linear"
          onClick={() => window.open(timetable)}
        >
          Download
          <span className="ml-2">
            <FiDownload />
          </span>
        </p>
      </div>
      {timetable && (
        <>
          {fileType === "pdf" ? (
            <embed
              className="mt-8 rounded-lg shadow-md sm:w-full max-w-[600px] mx-auto sm:h-[600px] h-[250px]"
              src={timetable}
              type="application/pdf"
              // height="600px"
            />
          ) : (
            <img
              className="mt-8 rounded-lg shadow-md w-full max-w-[600px] mx-auto h-auto"
              src={timetable}
              alt="timetable"
            />
          )}
        </>
      )}
      {!timetable && (
        <p className="mt-10">No Timetable Available At The Moment!</p>
      )}
    </div>
  );
};

export default Timetable;
