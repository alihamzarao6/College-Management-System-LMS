// StudentDetails.js
const express = require("express");
const router = express.Router();
const studentDetails = require("../../models/Students/StudentDetails");
const Subject = require("../../models/Other/Subject");

router.post("/getDetails", async (req, res) => {
  try {
    let user = await studentDetails.find(req.body);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "No Student Found" });
    }
    const data = {
      success: true,
      message: "Student Details Found!",
      user,
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/getDetailsAll/:department/:semester/:subject", async (req, res) => {
  try {
    const { department, semester, subject } =  req.params;

    const subjectIds = await Subject.find({
      name: { $in: subject },
    }).distinct("_id");

      const studentsDetails = await studentDetails.find({
        semester,
        subjects: { $in: subjectIds },
        department,
      });

    // if (!user) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "No Student Found" });
    // }
    const data = {
      success: true,
      message: "Student Details Found!",
      studentsDetails,
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/getDetails/:id", async (req, res) => {
  try {
    const user = await studentDetails.findById(req.params.id);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No Student Found",
      });
    }

    const data = {
      success: true,
      message: "Student Details Found!",
      user,
    };

    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});

router.post("/addDetails", async (req, res) => {
  try {
    const {
      enrollmentNo,
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      semester,
      department,
      gender,
      profile,
      subjects,
    } = req.body;

    // Check if the subjects array is within the limit
    if (!subjects || subjects.length < 1 || subjects.length > 6) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid number of subjects. Please select between 1 and 6 subjects.",
      });
    }

    let user = await studentDetails.findOne({ enrollmentNo });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "Student With This Enrollment Already Exists",
      });
    }

    user = await studentDetails.create({
      enrollmentNo,
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      semester,
      department,
      gender,
      profile,
      subjects,
    });

    const data = {
      success: true,
      message: "Student Details Added!",
      user,
    };

    res.json(data);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/updateDetails/:id", async (req, res) => {
  try {
     const { subjects } = req.body;

     // Check if the subjects array is within the limit
     if (subjects && (subjects.length < 1 || subjects.length > 6)) {
       return res.status(400).json({
         success: false,
         message:
           "Invalid number of subjects. Please select between 1 and 6 subjects.",
       });
     }

    let user = await studentDetails.findByIdAndUpdate(req.params.id, req.body);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No Student Found",
      });
    }

    const data = {
      success: true,
      message: "Updated Successfull!",
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.delete("/deleteDetails/:id", async (req, res) => {
  let { id } = req.body;
  try {
    let user = await studentDetails.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No Student Found",
      });
    };

    const data = {
      success: true,
      message: "Deleted Successfull!",
    };

    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/count", async (req, res) => {
  try {
    let user = await studentDetails.count(req.body);
    const data = {
      success: true,
      message: "Count Successfull!",
      user,
    };
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
});

module.exports = router;
