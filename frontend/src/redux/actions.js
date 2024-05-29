import {
  USER_DATA,
  USER_LOGIN_ID,
  CREATE_QUIZ_SUCCESS,
  CREATE_QUIZ_FAILURE,
  FETCH_QUIZZES_SUCCESS,
  FETCH_QUIZZES_FAILURE,
  SUBMIT_QUIZ_SUCCESS,
  SUBMIT_QUIZ_FAILURE,
  FETCH_QUIZ_RESULT_SUCCESS,
  FETCH_QUIZ_RESULT_FAILURE,
  GET_AVAILABLE_QUIZZES_SUCCESS,
  GET_AVAILABLE_QUIZZES_FAILURE,
  GET_TEACHER_QUIZZES,
  FETCH_ATTEMPTED_QUIZZES_SUCCESS,
  FETCH_ATTEMPTED_QUIZZES_FAILURE,
  FETCH_QUIZ_RESULT_FOR_STUDENT_SUCCESS,
  FETCH_QUIZ_RESULT_FOR_STUDENT_FAILURE,
  FETCH_STUDENT_QUIZZES_SUCCESS,
  FETCH_STUDENT_QUIZZES_FAILURE,
  SET_JWT_TOKEN,
  SET_USER_INFO,
  REMOVE_LAST_QUESTION,
  STORE_ANSWER,
  FETCH_QUIZ_DETAILS,
  REMOVE_JWT_TOKEN,
  UPDATE_ANSWER,
  UPDATE_ANSWER_EMPTY,
  SET_QUIZ_ID,
  FETCH_STUDENT_ASSIGNMENTS_SUCCESS,
  START_QUIZ_TIMER,
  STOP_QUIZ_TIMER,
  SET_QUIZ_TIMER,
  DECREMENT_QUIZ_TIMER,
  RESET_QUIZ_TIMER,
  UPDATE_REMAINING_TIME,
  SET_QUIZ_IN_PROGRESS,
  RESET_QUIZ_IN_PROGRESS,
  GET_TEACHER_ASSIGNMENTS,
  SET_ASSIGNMENT_ID,
} from "./action";

export const setUserData = (data) => ({
  type: USER_DATA,
  payload: data,
});

export const setUserID = (data) => ({
  type: USER_LOGIN_ID,
  payload: data,
});

export const setQuizId = (data) => ({
  type: SET_QUIZ_ID,
  payload: data,
});

export const setJWTToken = (token) => ({
  type: SET_JWT_TOKEN,
  payload: token,
});

export const removeJWTToken = () => ({
  type: REMOVE_JWT_TOKEN,
});

export const setUserInfo = (userInfo) => ({
  type: SET_USER_INFO,
  payload: userInfo,
});

export const createQuizSuccess = (quizDetails, questions) => {
  return {
    type: CREATE_QUIZ_SUCCESS,
    payload: { quizDetails, questions },
  };
};

export const createQuizFailure = () => ({
  type: CREATE_QUIZ_FAILURE,
  payload: {},
});

export const removeLastQuestion = () => ({
  type: REMOVE_LAST_QUESTION,
});

export const getTeacherQuizzes = (quizzes) => ({
  type: GET_TEACHER_QUIZZES,
  payload: quizzes,
});

export const submitQuizSuccess = (quizId, answers) => ({
  type: SUBMIT_QUIZ_SUCCESS,
  payload: { quizId, answers },
});

export const submitQuizFailure = (error) => ({
  type: SUBMIT_QUIZ_FAILURE,
  payload: error,
});

export const fetchQuizzesSuccess = (quizzes) => ({
  type: FETCH_QUIZZES_SUCCESS,
  payload: quizzes,
});

export const fetchQuizzesFailure = (error) => ({
  type: FETCH_QUIZZES_FAILURE,
  payload: error,
});

export const fetchStudentQuizzesSuccess = (quizzes) => ({
  type: FETCH_STUDENT_QUIZZES_SUCCESS,
  payload: quizzes,
});

export const fetchStudentAssignmentsSuccess = (assignments) => ({
  type: FETCH_STUDENT_ASSIGNMENTS_SUCCESS,
  payload: assignments,
});

export const fetchStudentQuizzesFailure = (error) => ({
  type: FETCH_STUDENT_QUIZZES_FAILURE,
  payload: error,
});

export const fetchQuizResultSuccess = (result) => ({
  type: FETCH_QUIZ_RESULT_SUCCESS,
  payload: result,
});

export const fetchQuizResultFailure = (error) => ({
  type: FETCH_QUIZ_RESULT_FAILURE,
  payload: error,
});

export const fetchQuizResultForStudentSuccess = (result) => ({
  type: FETCH_QUIZ_RESULT_FOR_STUDENT_SUCCESS,
  payload: result,
});

export const fetchQuizResultForStudentFailure = (error) => ({
  type: FETCH_QUIZ_RESULT_FOR_STUDENT_FAILURE,
  payload: error,
});

export const fetchAttemptedQuizzesSuccess = (quizzes) => ({
  type: FETCH_ATTEMPTED_QUIZZES_SUCCESS,
  payload: quizzes,
});

export const fetchAttemptedQuizzesFailure = (error) => ({
  type: FETCH_ATTEMPTED_QUIZZES_FAILURE,
  payload: error,
});

export const getAvailableQuizzesSuccess = (quizzes) => ({
  type: GET_AVAILABLE_QUIZZES_SUCCESS,
  payload: quizzes,
});

export const getAvailableQuizzesFailure = (error) => ({
  type: GET_AVAILABLE_QUIZZES_FAILURE,
  payload: error,
});

export const storeAnswer = (questionIndex, selectedOption) => ({
  type: STORE_ANSWER,
  payload: { questionIndex, selectedOption },
});

export const updateAnswer = (questionId, answer) => ({
  type: UPDATE_ANSWER,
  payload: {
    questionId,
    answer,
  },
});

export const updateAnswerEmpty = () => ({
  type: UPDATE_ANSWER_EMPTY,
  payload: {},
});

export const fetchQuizDetails = (quizId) => ({
  type: FETCH_QUIZ_DETAILS,
  payload: { quizId },
});

export const startQuizTimer = () => ({
  type: START_QUIZ_TIMER,
});

export const stopQuizTimer = () => ({
  type: STOP_QUIZ_TIMER,
});

export const setQuizTimer = (duration) => {
  return {
    type: SET_QUIZ_TIMER,
    payload: duration,
  };
};

export const decrementQuizTimer = () => ({
  type: DECREMENT_QUIZ_TIMER,
});

export const resetQuizTimer = () => ({
  type: RESET_QUIZ_TIMER,
});

export const updateRemainingTime = (time) => ({
  type: UPDATE_REMAINING_TIME,
  payload: time,
});

export const setQuizInProgress = () => ({
  type: SET_QUIZ_IN_PROGRESS,
});

export const resetQuizInProgress = () => ({
  type: RESET_QUIZ_IN_PROGRESS,
});

export const getTeacherAssignments = (assignments) => ({
  type: GET_TEACHER_ASSIGNMENTS,
  payload: assignments,
});

export const setAssignmentId = (assignmentId) => ({
  type: SET_ASSIGNMENT_ID,
  payload: assignmentId,
});