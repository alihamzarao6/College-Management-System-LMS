import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import { updateAnswer, updateAnswerEmpty, decrementQuizTimer, resetQuizTimer, updateRemainingTime, resetQuizInProgress } from '../../redux/actions';
import Quiz from './Quiz';
import { baseApiURL } from '../../baseUrl';

const QuizDisplay = ({ quizData, userId }) => {
  const dispatch = useDispatch();
  const selectedAnswers = useSelector((state) => state.quizData.answers || []);
  const jwtToken = useSelector((state) => state.jwtToken);
  const isQuizTimerRunning = useSelector((state) => state.isQuizTimerRunning);
  const quizTimer = useSelector((state) => state.quizTimer);

  const [currentPage, setCurrentPage] = useState(1);
  const [backtoQuizPage, setBacktoQuizPage] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const leaveTimeoutRef = useRef(null);
  

  const questionsPerPage = 5;

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = quizData.questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const handleUnload = useCallback(() => {
    if (!isSubmitted) {
      const submitData = {
        studentId: userId,
        quizId: quizData._id,
        answers: selectedAnswers.map((item) => item.text),
      };

      axios
        .post(`${baseApiURL}/quiz/submit`, submitData, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        })
        .then((response) => {
          toast.success('Quiz submitted successfully');
          dispatch(updateAnswerEmpty());
          dispatch(resetQuizInProgress());
          dispatch(resetQuizTimer());
          setIsSubmitted(true);
        })
        .catch((error) => {
          console.error('Error submitting quiz', error);
        });
    }
  }, [isSubmitted, selectedAnswers, userId, jwtToken, quizData._id, dispatch]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isQuizTimerRunning) {
        leaveTimeoutRef.current = setTimeout(() => {
          handleUnload();
        }, 3000);
      } else {
        clearTimeout(leaveTimeoutRef.current);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(leaveTimeoutRef.current);
    };
  }, [isQuizTimerRunning, handleUnload, isSubmitted]);

  useEffect(() => {
    if (isQuizTimerRunning && quizTimer > 0) {
      const timerInterval = setInterval(() => {
        dispatch(decrementQuizTimer());
        dispatch(updateRemainingTime(quizTimer));

        if (quizTimer === 0) {
          clearInterval(timerInterval);
          setIsSubmitted(true);
          handleUnload();
        }
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [isQuizTimerRunning, quizTimer, dispatch, setIsSubmitted, handleUnload]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleOptionChange = (selectedOption, questionId) => {
    dispatch(updateAnswer(questionId, selectedOption));
  };

  const handleSubmitQuiz = () => {
    const quizId = quizData._id;
    const studentId = userId;
    const submitData = {
      studentId,
      quizId,
      answers: selectedAnswers.map((item) => item.text),
    };

    axios
      .post(`${baseApiURL}/quiz/submit`, submitData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      .then((response) => {
        toast.success('Quiz submitted successfully');
        dispatch(updateAnswerEmpty());
        dispatch(resetQuizInProgress());
        dispatch(resetQuizTimer());
        setIsSubmitted(true);
      })
      .catch((error) => {
        toast.error('Please provide at least 1 Answer.');
      });
  };

  if (isSubmitted) {
    return <Quiz />;
  }

  if (backtoQuizPage) {
    return <Quiz />;
  }
  
  return (
    <div className="quiz-display-container bg-blue-200 p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold mb-4">{quizData.subject} Quiz Questions</h2>

      <div className="flex items-center p-2 mb-2 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
        <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
        </svg>
        <span className="sr-only">Info</span>
        <div>
          Changing the tab or leaving the window will result in auto submission of the quiz.
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="font-semibold text-lg">
          Time Remaining: {Math.floor(quizTimer / 60)}:{quizTimer % 60 < 10 ? `0${quizTimer % 60}` : quizTimer % 60}
        </p>
      </div>

      {currentQuestions.map((question, index) => (
        <div key={index} className="question-box bg-white p-4 md:p-6 rounded-md shadow-md mb-4">
          <p className="font-semibold text-lg">{`Question ${index + 1}: ${question.text}`}</p>
          <div className="options-container mt-2 md:mt-4 space-y-2">
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="option-container flex items-center space-x-2">
                <input
                  type="radio"
                  name={`question${index}`}
                  value={option.text}
                  className="mr-2"
                  disabled={false}
                  checked={selectedAnswers.find(item => item.questionId === question._id)?.text === option.text}
                  onChange={() => handleOptionChange(option.text, question._id)}
                />
                <label>{option.text}</label>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="pagination mt-4 md:mt-8 flex items-center space-x-2">
        {Array.from({ length: Math.ceil(quizData.questions.length / questionsPerPage) }).map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-1 md:px-2 py-1 rounded text-xs md:text-base ${currentPage === index + 1 ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'
              }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* 'Submit Quiz' button */}
      <button
        className="bg-blue-500 text-white px-2 md:px-4 py-1 md:py-2 rounded mt-2 md:mt-4 mr-2"
        onClick={handleSubmitQuiz}
      >
        Submit Quiz
      </button>
    </div>
  );
};

export default QuizDisplay;
