// assignment.js controller
const express = require("express");
const router = express.Router();

const Assignment = require("../../models/Assignment/Assignment");
const Department = require("../../models/Other/Department");
const Subject = require("../../models/Other/Subject");
const studentDetails = require("../../models/Students/StudentDetails");

// Create an assignment
router.post("/create", async (req, res) => {
  try {
    const { semester, subject, department, deadline, marks, fileUrl, title } =
      req.body;

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

    const assignment = await Assignment.create({
      semester,
      subject,
      department,
      deadline,
      totalMarks: marks,
      file: fileUrl,
      teacherId,
      title,
    });

    res.json({
      success: true,
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get assignments for a teacher
router.get("/teacher", async (req, res) => {
  try {
    const teacherId = req.user.userId;

    const assignments = await Assignment.find({ teacherId }).sort({'createdAt': -1});

    res.json({
      success: true,
      message: "Assignments fetched successfully",
      assignments,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get assignments for a student
router.get("/student", async (req, res) => {
  try {
    const { semester, subjects, department } = req.user.userDetails;

    const subjectNames = await Subject.find({
      _id: { $in: subjects },
    }).distinct("name");

    const assignments = await Assignment.find({
      semester,
      subject: { $in: subjectNames },
      department,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Assignments fetched successfully",
      assignments,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get a specific assignment by ID
router.get("/assignments/:assignmentId", async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Fetch the assignment by ID
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.json({
      success: true,
      message: "Assignment fetched successfully",
      assignment,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Submit an assignment
router.post("/submit", async (req, res) => {
  try {
    const { assignmentId, fileUrl } = req.body;
    const studentId = req.user.userId;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const currentDateTime = new Date();

    if (currentDateTime > assignment.deadline) {
      return res.status(400).json({
        success: false,
        message:
          "Assignment deadline has passed. You cannot submit the assignment.",
      });
    }

    await Assignment.findOneAndUpdate(
      { _id: assignmentId },
      {
        $push: {
          submissions: {
            studentId,
            fileUrl,
            submittedAt: new Date(),
            completed: true,
          },
        },
      }
    );

    res.json({
      success: true,
      message: "Assignment submitted successfully",
      assignment,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Grade an assignment submission
router.post("/grade", async (req, res) => {
  try {
    const { assignmentId, studentId, marks } = req.body;
    const teacherId = req.user.userId;

    // Check if the teacher is authorized to grade the assignment
    const isAuthorized = await Assignment.exists({
      _id: assignmentId,
      teacherId,
      "submissions.studentId": studentId,
    });

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to grade assignment",
      });
    };

    // Grade the assignment submission and update marks
    const updatedAssignment = await Assignment.findOneAndUpdate(
      { _id: assignmentId, "submissions.studentId": studentId },
      {
        $set: {
          "submissions.$.marks": marks,
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Assignment graded successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get assignment result for a teacher
router.get("/result/teacher/:assignmentId", async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const assignmentId = req.params.assignmentId;

    const isAuthorized = await Assignment.exists({
      _id: assignmentId,
      teacherId: teacherId,
    });

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to assignment result",
      });
    }

    const assignment = await Assignment.findById(assignmentId).populate({
      path: "submissions.studentId",
      model: "Student Credential",
    });

    const subjectNames = await Subject.find({
      name: assignment.subject,
    }).distinct("_id");

    const studentsSupposedToAttempt = await studentDetails.find({
      semester: assignment.semester,
      subjects: { $in: subjectNames },
      department: assignment.department,
    });

    const resultData = {
      assignment: {
        _id: assignment._id,
        semester: assignment.semester,
        subject: assignment.subject,
        department: assignment.department,
        deadline: assignment.deadline,
        totalMarks: assignment.totalMarks,
        title: assignment.title,
        completed: false,
      },
      studentsSupposedToAttempt: studentsSupposedToAttempt.map((student) => {
        // Find the corresponding student in the quiz's students array
        const assignmentStudent = assignment.submissions.find(
          (assignmentStudent) =>
            assignmentStudent.studentId._id.toString() ===
            student.userId.toString()
        );

        // Extract completed and obtainedMarks from the quiz's student data
        const completed = assignmentStudent
          ? assignmentStudent.completed
          : false;
        const fileUrl = assignmentStudent ? assignmentStudent.fileUrl : "";
        const marks = assignmentStudent ? assignmentStudent.marks : 0;

        return {
          studentId: student.userId,
          enrollmentNo: student.enrollmentNo,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          phoneNumber: student.phoneNumber,
          subjects: student.subjects,
          email: student.email,
          phoneNumber: student.phoneNumber,
          fileUrl,
          marks,
          completed,
        };
      }),
    };

    res.json({
      success: true,
      message: "Assignment result and list of students fetched successfully",
      result: resultData,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Update marks for a specific assignment submission
router.post("/result/teacher/:assignmentId", async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { studentId, marks } = req.body;
    const teacherId = req.user.userId;

    // Check if the teacher is authorized to update the assignment result
    const isAuthorized = await Assignment.exists({
      _id: assignmentId,
      teacherId,
      "submissions.studentId": studentId,
    });

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to update assignment result",
      });
    }

    // Update marks in the Assignment collection
    const updatedAssignment = await Assignment.findOneAndUpdate(
      { _id: assignmentId, "submissions.studentId": studentId },
      {
        $set: {
          "submissions.$.marks": marks,
        },
      },
      { new: true } // Return the updated assignment
    );

    res.json({
      success: true,
      message: "Assignment result updated successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
