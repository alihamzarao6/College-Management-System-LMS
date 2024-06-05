import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from 'react-redux';
import { FiLogIn } from "react-icons/fi";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { baseApiURL } from "../baseUrl";

import { setJWTToken, setUserInfo } from "../redux/actions";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selected, setSelected] = useState("Student");
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    if (data.loginid !== "" && data.password !== "") {
      const headers = {
        "Content-Type": "application/json",
      };

      axios
        .post(`${baseApiURL}/${selected.toLowerCase()}/auth/login`, data, {
          headers: headers,
        })
        .then((response) => {
          if (typeof response.data.access_token === "string") {
            const decodedUserInfo = jwtDecode(response.data.access_token);

            dispatch(setUserInfo(decodedUserInfo));
            dispatch(setJWTToken(response.data.access_token));
          }
          
          navigate(`/${selected.toLowerCase()}`, {
            state: { type: selected, loginid: response.data.loginid },
          });
        })
        .catch((error) => {
          toast.dismiss();
          console.error(error);
          toast.error(error.response.data.message);
        });
    } else {
      toast.error("Please enter both login ID and password.");
    }
  };

  return (
    <>
      <div className="bg-white flex flex-col items-center justify-center pt-5">
        <div className="flex gap-8">
          <button
            className={`text-blue-500 mr-6 font-semibold text-xl hover:text-blue-700 ease-linear duration-300 hover:ease-linear hover:duration-300 hover:transition-all transition-all ${selected === "Student" && "border-b-2 border-green-500"
              }`}
            onClick={() => setSelected("Student")}
          >
            Student
          </button>
          <button
            className={`text-blue-500 mr-6 text-xl font-semibold hover:text-blue-700 ease-linear duration-300 hover:ease-linear hover:duration-300 hover:transition-all transition-all ${selected === "Faculty" && "border-b-2 border-green-500"
              }`}
            onClick={() => setSelected("Faculty")}
          >
            Faculty
          </button>
          <button
            className={`text-blue-500 text-xl font-semibold hover:text-blue-700 ease-linear duration-300 hover:ease-linear hover:duration-300 hover:transition-all transition-all ${selected === "Admin" && "border-b-2 border-green-500"
              }`}
            onClick={() => setSelected("Admin")}
          >
            Admin
          </button>
        </div>
      </div>

      <div className="bg-white h-screen flex flex-col items-center justify-center">
        <p className="text-3xl font-semibold pb-2 border-b-2 border-green-500">
          {selected && selected} Login
        </p>
        <form
          className="flex flex-col items-center w-[100%] max-w-md mt-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col w-full max-sm:w-[85%] pb-5">
            <label className="mb-1" htmlFor="loginid">
              {selected && selected} Login ID
            </label>
            <input
              type="text"
              id="loginid"
              required
              className="bg-white outline-none border-2 border-gray-400 py-2 px-4 rounded-md w-full focus:border-blue-500"
              {...register("loginid")}
            />
          </div>
          <div className="flex flex-col w-full max-sm:w-[85%] mt-3 pb-5">
            <label className="mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              className="bg-white outline-none border-2 border-gray-400 py-2 px-4 rounded-md w-full focus:border-blue-500"
              {...register("password")}
            />
          </div>
          {/* Additional Form Fields can be added here */}
          <button className="bg-blue-500 mt-5 text-white px-6 py-2 text-xl rounded-md hover:bg-blue-700 ease-linear duration-300 hover:ease-linear hover:duration-300 hover:transition-all transition-all flex justify-center items-center">
            Login
            <span className="ml-2">
              <FiLogIn />
            </span>
          </button>
        </form>
        <Toaster position="bottom-center" />
      </div>
    </>
  );
};

export default Login;
