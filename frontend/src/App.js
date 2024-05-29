import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import mystore from "./redux/store";
import Login from "./components/Login";
import StudentHome from "./Screens/Student/Home";
import FacultyHome from "./Screens/Faculty/Home";
import AdminHome2 from "./Screens/Admin/Home2";

import { withAuthCheck, PrivateRoute } from "./authUtils";

const StudentHomeWithAuth = withAuthCheck(StudentHome);
const FacultyHomeWithAuth = withAuthCheck(FacultyHome);
const AdminHome2WithAuth = withAuthCheck(AdminHome2);

const App = () => {

  return (
    <Provider store={mystore}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="student"
            element={<PrivateRoute element={<StudentHomeWithAuth />} />}
          />
          <Route
            path="faculty"
            element={<PrivateRoute element={<FacultyHomeWithAuth />} />}
          />
          <Route
            path="admin"
            element={<PrivateRoute element={<AdminHome2WithAuth />} />}
          />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
