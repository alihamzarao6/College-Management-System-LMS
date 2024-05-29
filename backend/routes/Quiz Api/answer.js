// controllers/Answer.js
const express = require("express");
const router = express.Router();
const Answer = require("../../models/Quiz/Answer");

// Add an answer to a question
router.post("/add", async (req, res) => {
  try {
    const { questionId, text, isCorrect } = req.body;

    // Add the answer to the database
    const answer = await Answer.create({
      question: questionId,
      text,
      isCorrect,
    });

    res.json({ success: true, message: "Answer added successfully", answer });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
