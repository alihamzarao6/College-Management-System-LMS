// Quiz.js Model
const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    semester: {
      type: Number,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    marksPerQuestion: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
    },
    questions: [
      {
        text: {
          type: String,
          required: true,
        },
        options: [
          {
            text: {
              type: String,
              required: true,
            },
          },
        ],
        correctOption: {
          type: String,
          required: true,
        },
      },
    ],
    students: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student Credential",
        },
        completed: {
          type: Boolean,
          default: false,
        },
        obtainedMarks: {
          type: Number,
          default: 0,
        },
        answers: [
          {
            text: {
              type: String,
              required: true,
            },
            questionId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Question",
              required: true,
            },
          },
        ],
      },
    ],
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty Credential",
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
