import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import Quiz from './Quiz';

const QuizDisplay = ({ quizData }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [backtoQuizPage, setBacktoQuizPage] = useState(false);

    const [revealedOptions, setRevealedOptions] = useState(Array(quizData.questions.length).fill(''));

    const questionsPerPage = 10;

    const indexOfLastQuestion = currentPage * questionsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
    const currentQuestions = quizData.questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const revealCorrectOption = (correctOption, questionIndex) => {
        setRevealedOptions((prevOptions) => {
            const newOptions = [...prevOptions];
            newOptions[questionIndex] = correctOption;
            return newOptions;
        });
    };

    const isOptionRevealed = (correctOption, questionIndex) => revealedOptions[questionIndex] === correctOption;

    const backtoQuiz = () => {
        setBacktoQuizPage(true);
    };

    if (backtoQuizPage) {
        return <Quiz />;
    }

    return (
        <div>
            <div className="quiz-display-container bg-blue-200 p-4 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold mb-4">{quizData.title} Questions</h2>
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
                                        disabled={isOptionRevealed(option.text, index)}
                                    />
                                    <label>{option.text}</label>
                                </div>
                            ))}
                        </div>
                        <div className="controls-container mt-2 md:mt-4 flex items-center space-x-2 md:space-x-4">
                            <button
                                className="bg-green-500 text-white px-2 md:px-3 py-1 rounded text-xs md:text-base"
                                onClick={() => revealCorrectOption(question.correctOption, index)}
                                disabled={isOptionRevealed(question.correctOption, index)}
                            >
                                <FaEye className="mr-1 md:mr-2" /> Reveal Correct Option
                            </button>
                        </div>
                        {revealedOptions[index] && (
                            <div className="revealed-option mt-2">
                                <p>Correct Answer:</p>
                                <p>{revealedOptions[index]}</p>
                            </div>
                        )}
                    </div>
                ))}

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
            </div>

            <button
                className="bg-blue-500 text-white px-2 md:px-4 py-1 md:py-2 rounded mt-2 md:mt-4 ml-auto"
                onClick={backtoQuiz}
            >
                Back to Quiz
            </button>
        </div>
    );
};

export default QuizDisplay;
