import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Heading from "../../components/Heading";
import { MdOutlineDelete } from "react-icons/md";
import { baseApiURL } from "../../baseUrl";

const Department = () => {
  const [data, setData] = useState({
    name: "",
  });
  const [selected, setSelected] = useState("add");
  const [department, setDepartment] = useState();
  useEffect(() => {
    getDepartmentHandler();
  }, []);

  const getDepartmentHandler = () => {
    axios
      .get(`${baseApiURL}/department/getDepartment`)
      .then((response) => {
        if (response.data.success) {
          setDepartment(response.data.departments);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error(error.message);
      });
  };

  const addDepartmentHandler = () => {
    toast.loading("Adding Department");
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post(`${baseApiURL}/department/addDepartment`, data, {
        headers: headers,
      })
      .then((response) => {
        toast.dismiss();
        if (response.data.success) {
          toast.success(response.data.message);
          setData({ name: "", code: "" });
          getDepartmentHandler();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.dismiss();
        toast.error(error.response.data.message);
      });
  };

  const deleteDepartmentHandler = (id) => {
    const alert = prompt("Are You Sure? Type CONFIRM to continue");
    if (alert === "CONFIRM") {
      toast.loading("Deleting Department");
      const headers = {
        "Content-Type": "application/json",
      };
      axios
        .delete(`${baseApiURL}/department/deleteDepartment/${id}`, {
          headers: headers,
        })
        .then((response) => {
          toast.dismiss();
          if (response.data.success) {
            toast.success(response.data.message);
            getDepartmentHandler();
          } else {
            toast.error(response.data.message);
          }
        })
        .catch((error) => {
          toast.dismiss();
          toast.error(error.response.data.message);
        });
    }
  };
  return (
    <div className="w-[85%] mx-auto mt-7 flex justify-center items-start flex-col mb-10">
      <div className="flex justify-between items-center w-full">
        <Heading title="Add Department" />
        <div className="flex justify-end items-center w-full">
          <button
            className={`${
              selected === "add" && "border-b-2 "
            }border-blue-500 px-4 py-2 text-black rounded-sm mr-6`}
            onClick={() => setSelected("add")}
          >
            Add Department
          </button>
          <button
            className={`${
              selected === "view" && "border-b-2 "
            }border-blue-500 px-4 py-2 text-black rounded-sm`}
            onClick={() => setSelected("view")}
          >
            View Department
          </button>
        </div>
      </div>
      {selected === "add" && (
        <div className="flex flex-col justify-center items-center w-full mt-8">
          <div className="w-[40%]">
            <label htmlFor="name" className="leading-7 text-sm ">
              Enter Department Name
            </label>
            <input
              type="name"
              id="name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full bg-blue-50 rounded border focus:border-dark-green focus:bg-secondary-light focus:ring-2 focus:ring-light-green text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
          </div>
          <button
            className="mt-6 bg-blue-500 px-6 py-3 text-white"
            onClick={addDepartmentHandler}
          >
            Add Department
          </button>
        </div>
      )}
      {selected === "view" && (
        <div className="mt-8 w-full">
          <ul>
            {department &&
              department.map((item, index) => {
                return (
                  <li
                    key={index}
                    className="bg-blue-100 py-3 px-6 mb-3 flex justify-between items-center w-[70%]"
                  >
                    <div>{item.name}</div>
                    <button
                      className="text-2xl hover:text-red-500"
                      onClick={() => deleteDepartmentHandler(item._id)}
                    >
                      <MdOutlineDelete />
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Department;
