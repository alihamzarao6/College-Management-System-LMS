import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

import Quiz from './Quiz';
import { baseApiURL } from '../../baseUrl';

const QuizResult = ({ quizId }) => {
  const selectedAnswers = useSelector((state) => state.quizData.answers || []);
  const jwtToken = useSelector((state) => state.jwtToken);

  const [backToQuizPage, setBackToQuizPage] = useState(false);
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    axios
      .get(`${baseApiURL}/quiz/result/student/${quizId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })
      .then((response) => {
        const resultData = response.data.result;
        setQuizData(resultData);
      })
      .catch((error) => {
        console.error('Error fetching quiz result', error);
        toast.error('Error fetching quiz result');
      });
  }, [quizId, jwtToken]);

  if (!quizData) {
    return <div>Loading...</div>;
  }

  const backToQuiz = () => {
    setBackToQuizPage(true);
  };

  const downloadAsPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    pdf.text(`Quiz: ${quizData.quiz.subject}`, 10, 10);
    pdf.text(`Total Marks: ${quizData.quiz.totalMarks}`, 10, 20);
    pdf.text(`Obtained Marks: ${quizData.obtainedMarks}`, 10, 30);

    quizData.questions.forEach((question, index) => {
      if (index !== 0 && index % 2 === 0) {
        pdf.addPage();
      }

      const yOffset = 40 + (index % 2) * 90;

      pdf.text(`Question ${index + 1}: ${question.text}`, 10, yOffset + 10);

      question.options.forEach((option, optionIndex) => {
        const optionYOffset = yOffset + 20 + optionIndex * 10;
        pdf.text(`${optionIndex + 1}. ${option.text}`, 20, optionYOffset);
      });

      const correctOptionYOffset = yOffset + 20 + (question.options.length + 2) * 10;
      const selectedOptionYOffset = correctOptionYOffset + 10;

      pdf.text(`Correct Option: ${question.correctOption}`, 20, correctOptionYOffset);
      pdf.text(`Your Answer: ${question.isAnswered ? question.selectedOption : 'Not attempted'}`, 20, selectedOptionYOffset);

      pdf.line(10, selectedOptionYOffset + 3, 200, selectedOptionYOffset + 3);
    });

    pdf.save('quiz_result.pdf');
  };

  if (backToQuizPage) {
    return <Quiz />;
  }

  return (
    <div className="quiz-result-container bg-blue-200 p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold mb-4">{quizData.quiz.subject} Quiz Result</h2>
      <div className="result-info mb-4">
        <p>Total Marks: {quizData.quiz.totalMarks}</p>
        <p>Obtained Marks: {quizData.obtainedMarks}</p>
      </div>
      {quizData.questions.map((question, index) => (
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
                  disabled={true}
                  checked={selectedAnswers.find(item => item.questionId === question._id)?.text === option.text}
                />
                <label>{option.text}</label>
              </div>
            ))}
          </div>
          <div className="result-info mt-4">
            <p><strong>Correct Option:</strong>{' '}{question.correctOption}</p>
            <p><strong>Your Answer:</strong>{' '}{question.isAnswered ? question.selectedOption : 'Not attempted'}</p>
            <p><strong>Is Correct:</strong>{' '}{question.isCorrect ? 'Yes' : 'No'}</p>
          </div>
        </div>
      ))}

      <button
        className="bg-green-500 text-white px-2 md:px-4 py-1 md:py-2 rounded mt-2 md:mt-4 mr-2"
        onClick={downloadAsPDF}
      >
        Download Quiz
      </button>
      <button
        className="bg-blue-500 text-white px-2 md:px-4 py-1 md:py-2 rounded mt-2 md:mt-4 ml-auto"
        onClick={backToQuiz}
      >
        Back to Quiz Page
      </button>
    </div>
  );
};

export default QuizResult;
