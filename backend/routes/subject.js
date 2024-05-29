const express = require("express");
const router = express.Router();
const Subject = require("../models/Other/Subject");
const FacultyDetails = require("../models/Faculty/FacultyDetails");

const { Types } = require("mongoose");
const StudentDetails = require("../models/Students/StudentDetails");
const { ObjectId } = Types;

router.get("/getSubject", async (req, res) => {
  try {
    let subject = await Subject.find();
    if (!subject) {
      return res
        .status(400)
        .json({ success: false, message: "No Subject Available" });
    }
    const data = {
      success: true,
      message: "All Subject Loaded!",
      subject,
    };
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/getSubject/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let subject = await Subject.findById(id);
    if (!subject) {
      return res
        .status(400)
        .json({ success: false, message: "No Subject Available" });
    }
    const data = {
      success: true,
      message: "Subject Loaded!",
      subject,
    };
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/getSubjectS/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const objectId = new ObjectId(id);
    let subject = await Subject.findById(objectId);
    if (!subject) {
      return res
        .status(400)
        .json({ success: false, message: "No Subject Available" });
    }
   
    res.json(subject);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/addSubject", async (req, res) => {
  let { name, code } = req.body;
  try {
    let subject = await Subject.findOne({ code });
    if (subject) {
      return res
        .status(400)
        .json({ success: false, message: "Subject Already Exists" });
    }
    await Subject.create({
      name,
      code,
    });
    const data = {
      success: true,
      message: "Subject Added!",
    };
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.delete("/deleteSubject/:id", async (req, res) => {
  try {
    let deletedSubject = await Subject.findByIdAndDelete(req.params.id);
    if (!deletedSubject) {
      return res
        .status(400)
        .json({ success: false, message: "No Subject Exists!" });
    }

     await FacultyDetails.updateMany(
       { subjects: deletedSubject._id },
       { $pull: { subjects: deletedSubject._id } }
     );

     await StudentDetails.updateMany(
       { subjects: deletedSubject._id },
       { $pull: { subjects: deletedSubject._id } }
     );

    const data = {
      success: true,
      message: "Subject Deleted!",
    };
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
