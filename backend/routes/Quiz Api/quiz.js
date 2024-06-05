// quiz.js controller
const express = require("express");
const router = express.Router();

const Quiz = require("../../models/Quiz/Quiz");
const Department = require("../../models/Other/Department");
const Question = require("../../models/Quiz/Question");
const Subject = require("../../models/Other/Subject");
const studentDetails = require("../../models/Students/StudentDetails");

// Create a quiz
router.post("/create", async (req, res) => {
  try {
    const {
      semester,
      subject,
      department,
      deadline,
      marksPerQuestion,
      duration,
      questions,
      title,
    } = req.body;

    const teacherId = req.user.userId;

    const validDepartment = await Department.find({
      name: { $in: req.user.userDetails.departments },
    });

    if (!validDepartment) {
      return res.status(400).json({
        success: false,
        message: "Invalid department for the teacher",
      });
    }

    if (
      !questions ||
      !questions.length ||
      !questions.some(
        (question) => question.options && question.options.length > 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Quiz must contain at least one question with options",
      });
    }

    const totalMarks = questions.length * marksPerQuestion;

    const quiz = await Quiz.create({
      semester,
      subject,
      department,
      deadline,
      marksPerQuestion,
      totalMarks,
      duration,
      questions: questions.map((q) => ({
        text: q.text,
        options: q.options,
        correctOption: q.correctOption,
      })),
      teacherId: teacherId,
      title,
    });

    const createdQuestions = await Question.create(
      questions.map((question) => ({ ...question, quiz: quiz._id }))
    );

    await Quiz.findByIdAndUpdate(quiz._id, {
      $set: {
        questions: createdQuestions.map((question) => ({
          _id: question._id,
          text: question.text,
          options: question.options,
          correctOption: question.correctOption,
        })),
        totalMarks: totalMarks,
      },
    });

    res.json({ success: true, message: "Quiz created successfully", quiz });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/quizzes/:quizId", async (req, res) => {
  try {
    const quizId = req.params.quizId;

    const quiz = await Quiz.findById(quizId).populate({
      path: "questions",
      model: "Question",
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      message: "Quiz fetched successfully",
      quiz,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get quizzes for a teacher
router.get("/teacher", async (req, res) => {
  try {
    const teacherId = req.user.userId;

    const quizzes = await Quiz.find({ teacherId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Quizzes fetched successfully",
      quizzes,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get quizzes for a student
router.get("/student", async (req, res) => {
  try {
    const { semester, subjects, department } = req.user.userDetails;

    const subjectNames = await Subject.find({
      _id: { $in: subjects },
    }).distinct("name");

    const quizzes = await Quiz.find({
      semester,
      subject: { $in: subjectNames },
      department,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Quizzes fetched successfully",
      quizzes,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Submit a quiz
router.post("/submit", async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const studentId = req.user.userId;

    if (!answers) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least 1 Answer.",
      });
    }

    const quizStatus = await Quiz.findOne({
      _id: quizId,
      students: { $elemMatch: { studentId, completed: true } },
    });

    if (quizStatus) {
      return res.status(400).json({
        success: false,
        message: "Quiz already completed. Further attempts are not allowed.",
      });
    }

    const quiz = await Quiz.findById(quizId);

    const currentDateTime = new Date();

    if (currentDateTime > quiz.deadline) {
      return res.status(400).json({
        success: false,
        message: "Quiz deadline has passed. You cannot submit the quiz.",
      });
    }

    let obtainedMarks = 0;
    const answersMap = [];

    quiz.questions.forEach((question, index) => {
      const selectedOption = answers[index + 1] || "";
      answersMap.push({
        questionId: question._id.toString(),
        text: selectedOption,
      });

      if (selectedOption === question.correctOption) {
        obtainedMarks += quiz.marksPerQuestion;
      }
    });

    await Quiz.findOneAndUpdate(
      { _id: quizId },
      {
        $push: {
          students: {
            studentId,
            completed: true,
            obtainedMarks,
            answers: answersMap,
          },
        },
      }
    );

    res.json({
      success: true,
      message: "Quiz submitted successfully",
      obtainedMarks,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get quiz results for all students who are supposed to attempt the quiz
router.get("/result/teacher/:quizId", async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const quizId = req.params.quizId;

    const isAuthorized = await Quiz.exists({
      _id: quizId,
      teacherId: teacherId,
    });

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to quiz result",
      });
    }

    const quiz = await Quiz.findById(quizId).populate({
      path: "questions",
      model: "Question",
    });

    const subjectNames = await Subject.find({
      name: quiz.subject,
    }).distinct("_id");

    const studentsSupposedToAttempt = await studentDetails.find({
      semester: quiz.semester,
      subjects: { $in: subjectNames },
      department: quiz.department,
    });

    const resultData = {
      quiz: {
        _id: quiz._id,
        semester: quiz.semester,
        subject: quiz.subject,
        department: quiz.department,
        deadline: quiz.deadline,
        marksPerQuestion: quiz.marksPerQuestion,
        totalMarks: quiz.totalMarks,
        obtainedMarks: 0,
        completed: false,
        title: quiz.title,
      },
      studentsSupposedToAttempt: studentsSupposedToAttempt.map((student) => {
        const quizStudent = quiz.students.find((quizStudent) => {
          return quizStudent.studentId === student.userId;
        });

        const completed = quizStudent ? quizStudent.completed : false;
        const obtainedMarks = quizStudent ? quizStudent.obtainedMarks : 0;

        return {
          studentId: student.userId,
          enrollmentNo: student.enrollmentNo,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          phoneNumber: student.phoneNumber,
          subjects: student.subjects,
          obtainedMarks,
          completed,
        };
      }),
      questions: [],
    };

    quiz.questions.forEach((question) => {
      const questionData = {
        _id: question._id,
        text: question.text,
        options: question.options,
        correctOption: question.correctOption,
      };

      resultData.questions.push(questionData);
    });

    res.json({
      success: true,
      message: "Quiz result and list of students fetched successfully",
      result: resultData,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get quiz result for a student
router.get("/result/student/:quizId", async (req, res) => {
  try {
    const studentId = req.user.userId;
    const quizId = req.params.quizId;

    // Fetch the quiz and associated questions
    const quiz = await Quiz.findById(quizId).populate({
      path: "questions",
      model: "Question",
    });

    // Fetch the student's details and quiz attempt
    const studentAttempt = quiz.students.find(
      (student) => student.studentId.toString() === studentId
    );

    const resultData = {
      quiz: {
        _id: quiz._id,
        semester: quiz.semester,
        subject: quiz.subject,
        department: quiz.department,
        deadline: quiz.deadline,
        marksPerQuestion: quiz.marksPerQuestion,
        totalMarks: quiz.totalMarks,
        title: quiz.title,
      },
      obtainedMarks: studentAttempt.obtainedMarks,
      questions: [],
    };

    quiz.questions.forEach((question) => {
      const isAnswered = studentAttempt.answers.some(
        (answer) => answer.questionId.toString() === question._id.toString()
      );

      const studentAnswer = isAnswered
        ? studentAttempt.answers.find(
            (answer) => answer.questionId.toString() === question._id.toString()
          ).text
        : null;

      const isCorrect =
        isAnswered && studentAnswer && studentAnswer === question.correctOption;

      const questionData = {
        _id: question._id,
        text: question.text,
        options: question.options,
        correctOption: question.correctOption,
        isAnswered,
        selectedOption: studentAnswer,
        isCorrect: isCorrect,
      };

      resultData.questions.push(questionData);
    });

    res.json({
      success: true,
      message: "Quiz result fetched successfully",
      result: resultData,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Delete a quiz
router.delete("/quizzes/:quizId", async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const teacherId = req.user.userId;

    // Check if the quiz exists
    const quiz = await Quiz.findOne({
      _id: quizId,
      teacherId: teacherId,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    await quiz.deleteOne();

    res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
