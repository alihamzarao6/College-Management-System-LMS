// controllers/Question.js
const express = require("express");
const router = express.Router();
const Question = require("../../models/Quiz/Question");

// Add a question to the database
router.post("/add", async (req, res) => {
  try {
    const { quizId, text, options, correctOption } = req.body;

    // Add the question to the database
    const question = await Question.create({
      quiz: quizId,
      text,
      options,
      correctOption,
    });

    res.json({
      success: true,
      message: "Question added successfully",
      question,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get questions for a quiz
router.get("/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;

    // Fetch questions for the specified quiz
    const questions = await Question.find({ quiz: quizId });

    res.json({
      success: true,
      message: "Questions fetched successfully",
      questions,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
