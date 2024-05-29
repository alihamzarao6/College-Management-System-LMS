import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Navigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { setJWTToken, setUserInfo } from "./redux/actions";

export const withAuthCheck = (WrappedComponent) => {
  const ComponentWithAuthCheck = (props) => {
    const dispatch = useDispatch();

    useEffect(() => {
      const checkTokenExpiration = () => {
        const storedToken = localStorage.getItem("jwtToken");

        if (storedToken) {
          const decodedToken = jwtDecode(storedToken);

          if (decodedToken.exp * 1000 < Date.now()) {
            localStorage.removeItem("jwtToken");
            // Optionally, you can redirect to the login page here
          } else {
            dispatch(setJWTToken(storedToken));
            dispatch(setUserInfo(decodedToken));
          }
        }
      };

      checkTokenExpiration();
    }, [dispatch]);

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuthCheck;
};

export const withQuizId = (WrappedComponent) => {
  const ComponentWithQuizId = (props) => {
    const quizId = useSelector((state) => state.quizId);

    return <WrappedComponent {...props} quizId={quizId} />;
  };

  return ComponentWithQuizId;
};


export const PrivateRoute = ({ element, ...rest }) => {
  const isAuthenticated = useSelector((state) => !!state.jwtToken);

  return isAuthenticated ? (
    React.cloneElement(element, rest)
  ) : (
    <Navigate to="/" />
  );
};
