const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
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
    deadline: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty Credential",
      required: true,
    },
    file: {
      type: String,
      required: true,
    },
    totalMarks: {
      type: String,
      required: true,
    },
    submissions: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student Credential",
        },
        fileUrl: {
          type: String,
        },
        marks: {
          type: Number,
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
