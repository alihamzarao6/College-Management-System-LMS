const express = require("express");
const router = express.Router();
const Department = require("../models/Other/Department");
const facultyDetails = require("../models/Faculty/FacultyDetails");

router.get("/getDepartment", async (req, res) => {
  try {
    let departments = await Department.find();

    const data = {
      success: true,
      message: "All Departments Loaded!",
      departments,
    };
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/getDepartment/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let department = await Department.findById(id);
    if (!department) {
      return res
        .status(400)
        .json({ success: false, message: "No Department Available" });
    }
    const data = {
      success: true,
      message: "Department Loaded!",
      department,
    };
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/addDepartment", async (req, res) => {
  let { name } = req.body;
  try {
    let branch = await Department.findOne({ name });
    if (branch) {
      const data = {
        success: false,
        message: "Already Exists!",
      };
      res.status(400).json(data);
    } else {
      await Department.create(req.body);
      const data = {
        success: true,
        message: "Department Added!",
      };
      res.json(data);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.delete("/deleteDepartment/:id", async (req, res) => {
  try {
    let deletedDepartment = await Department.findByIdAndDelete(req.params.id);
    if (!deletedDepartment) {
      return res
        .status(400)
        .json({ success: false, message: "No Department Data Exists!" });
    }

    await facultyDetails.updateMany(
      { departments: deletedDepartment._id },
      { $pull: { departments: deletedDepartment._id } }
    );

    const data = {
      success: true,
      message: "Department Deleted!",
    };
    res.json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
