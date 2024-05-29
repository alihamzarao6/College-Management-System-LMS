// reducers
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
  FETCH_QUIZ_DETAILS,
  REMOVE_JWT_TOKEN,
  UPDATE_ANSWER,
  UPDATE_ANSWER_EMPTY,
  FETCH_STUDENT_ASSIGNMENTS_SUCCESS,
  SET_QUIZ_ID,
  SET_QUIZ_TIMER,
  DECREMENT_QUIZ_TIMER,
  UPDATE_REMAINING_TIME,
  START_QUIZ_TIMER,
  STOP_QUIZ_TIMER,
  RESET_QUIZ_TIMER,
  SET_QUIZ_IN_PROGRESS,
  RESET_QUIZ_IN_PROGRESS,
  GET_TEACHER_ASSIGNMENTS,
  SET_ASSIGNMENT_ID,
} from "./action";

let initialState = {
  userInfo: {},
  jwtToken: localStorage.getItem("jwtToken") || null,
  userData: {},
  userLoginId: "",
  quizId: "",
  quizzes: [],
  quizData: {
    questions: [],
    answers: [{}],
  },
  quizResult: null,
  error: null,
  quizTimer: 0,
  isQuizTimerRunning: false,
  remainingTime: 0,
  isQuizInProgress: true,
  assignments: [],
};

export const reducers = (state = initialState, action) => {
  switch (action.type) {
    case USER_DATA:
      return {
        ...state,
        userData: { ...state.userData, ...action.payload },
      };

    case USER_LOGIN_ID:
      return { ...state, userLoginId: action.payload };

    case SET_JWT_TOKEN:
      localStorage.setItem("jwtToken", action.payload);
      return { ...state, jwtToken: action.payload };

    case REMOVE_JWT_TOKEN:
      localStorage.removeItem("jwtToken");
      return { ...state, jwtToken: null };

    case SET_USER_INFO:
      return { ...state, userInfo: action.payload };

    case SET_QUIZ_ID:
      return { ...state, quizId: action.payload };

    case CREATE_QUIZ_SUCCESS:
      return {
        ...state,
        quizData: {
          ...state.quizData,
          questions: action.payload.questions,
        },
      };

    case CREATE_QUIZ_FAILURE:
      return { ...state, quizData: {} };

    case GET_TEACHER_QUIZZES:
      return { ...state, quizzes: action.payload, error: null };

    case SUBMIT_QUIZ_SUCCESS:
      return { ...state, quizResult: action.payload, error: null };

    case SUBMIT_QUIZ_FAILURE:
      return { ...state, quizResult: null, error: action.payload };

    case FETCH_QUIZZES_SUCCESS:
      return { ...state, quizzes: action.payload, error: null };

    case FETCH_QUIZZES_FAILURE:
      return { ...state, quizzes: [], error: action.payload };

    case FETCH_STUDENT_QUIZZES_SUCCESS:
      return { ...state, quizzes: action.payload, error: null };

    case FETCH_STUDENT_ASSIGNMENTS_SUCCESS:
      return { ...state, assignments: action.payload, error: null };

    case FETCH_STUDENT_QUIZZES_FAILURE:
      return { ...state, quizzes: [], error: action.payload };

    case FETCH_QUIZ_RESULT_SUCCESS:
      return { ...state, quizResult: action.payload, error: null };

    case FETCH_QUIZ_RESULT_FAILURE:
      return { ...state, quizResult: null, error: action.payload };

    case FETCH_QUIZ_RESULT_FOR_STUDENT_SUCCESS:
      return { ...state, quizResultForStudent: action.payload, error: null };

    case FETCH_QUIZ_RESULT_FOR_STUDENT_FAILURE:
      return { ...state, quizResultForStudent: null, error: action.payload };

    case FETCH_ATTEMPTED_QUIZZES_SUCCESS:
      return { ...state, attemptedQuizzes: action.payload, error: null };

    case FETCH_ATTEMPTED_QUIZZES_FAILURE:
      return { ...state, attemptedQuizzes: [], error: action.payload };

    case GET_AVAILABLE_QUIZZES_SUCCESS:
      return { ...state, availableQuizzes: action.payload, error: null };

    case GET_AVAILABLE_QUIZZES_FAILURE:
      return { ...state, availableQuizzes: [], error: action.payload };

    case UPDATE_ANSWER:
      const { questionId, answer } = action.payload;
      const existingAnswerIndex = state.quizData.answers.findIndex(
        (item) => item.questionId === questionId
      );

      if (existingAnswerIndex !== -1) {
        const updatedAnswers = state.quizData.answers.map((item, index) =>
          index === existingAnswerIndex ? { ...item, text: answer } : item
        );

        return {
          ...state,
          quizData: {
            ...state.quizData,
            answers: updatedAnswers,
          },
        };
      } else {
        return {
          ...state,
          quizData: {
            ...state.quizData,
            answers: [...state.quizData.answers, { questionId, text: answer }],
          },
        };
      }

    case UPDATE_ANSWER_EMPTY:
      return {
        ...state,
        quizData: {
          ...state.quizData,
          answers: [],
        },
      };

    case FETCH_QUIZ_DETAILS:
      return {
        ...state,
        quizData: {
          ...state.quizData,
          ...action.payload,
        },
      };

    case SET_QUIZ_TIMER:
      return {
        ...state,
        quizTimer: action.payload,
        remainingTime: action.payload,
      };

    case DECREMENT_QUIZ_TIMER:
      return {
        ...state,
        quizTimer: Math.max(0, state.quizTimer - 1),
        remainingTime: Math.max(0, state.remainingTime - 1),
      };

    case UPDATE_REMAINING_TIME:
      return {
        ...state,
        remainingTime: action.payload,
      };

    case START_QUIZ_TIMER:
      return {
        ...state,
        isQuizTimerRunning: true,
      };

    case STOP_QUIZ_TIMER:
      return {
        ...state,
        isQuizTimerRunning: false,
      };

    case RESET_QUIZ_TIMER:
      return {
        ...state,
        quizTimer: 0,
        remainingTime: 0,
        isQuizTimerRunning: false,
      };

    case SET_QUIZ_IN_PROGRESS:
      return {
        ...state,
        isQuizInProgress: false,
      };

    case RESET_QUIZ_IN_PROGRESS:
      return {
        ...state,
        isQuizInProgress: true,
      };

    case GET_TEACHER_ASSIGNMENTS:
      return {
        ...state,
        assignments: action.payload,
      };

    case SET_ASSIGNMENT_ID:
      return { ...state, assignmentId: action.payload };

    default:
      return state;
  }
};
