// StudentCredentials.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const studentCredential = require("../../models/Students/StudentCredentials");
const studentDetails = require("../../models/Students/StudentDetails");

router.post("/login", async (req, res) => {
  let { loginid, password } = req.body;
  try {
    let user = await studentCredential.findOne({ loginid });

    if (!user || password !== user.password) {
      return res
        .status(400)
        .json({ success: false, message: "Wrong Credentials" });
    }

    let userDetails = await studentDetails.findOne({
      enrollmentNo: user.loginid,
    });

    const token = jwt.sign(
      { userId: user.id, userType: "student", userDetails },
      process.env.JWT_KEY,
      {
        expiresIn: "7d",
      }
    );

    const data = {
      success: true,
      message: "Login Successfull!",
      loginid: user.loginid,
      id: user.id,
      access_token: token,
    };

    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/register", async (req, res) => {
  let { loginid, password } = req.body;
  try {
    let user = await studentCredential.findOne(req.body);
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User With This LoginId Already Exists",
      });
    }
    user = await studentCredential.create({
      loginid,
      password,
    });
    const data = {
      success: true,
      message: "Register Successfull!",
      loginid: user.loginid,
      id: user.id,
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/update/:id", async (req, res) => {
  try {
    let user = await studentCredential.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No User Exists!",
      });
    }
    const data = {
      success: true,
      message: "Updated Successfull!",
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    let user = await studentCredential.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No User Exists!",
      });
    }
    const data = {
      success: true,
      message: "Deleted Successfull!",
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
