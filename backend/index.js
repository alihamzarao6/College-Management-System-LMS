const connectToMongo = require("./Database/db");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
connectToMongo();
const port = 5000 || process.env.PORT;
var cors = require("cors");
const verifyToken = require("./Middlewares/authMiddleware");

app.use(cors());
app.use(express.json()); //to convert request data to json
app.use(bodyParser.json());
app.use(cookieParser());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    res.status(400).send({ error: "Invalid JSON" });
  } else {
    next();
  }
});

// Credential Apis
app.use("/api/student/auth", require("./routes/Student Api/studentCredential"));
app.use("/api/faculty/auth", require("./routes/Faculty Api/facultyCredential"));
app.use("/api/admin/auth", require("./routes/Admin Api/adminCredential"));
// Details Apis
app.use("/api/student/details", require("./routes/Student Api/studentDetails"));
app.use("/api/faculty/details", require("./routes/Faculty Api/facultyDetails"));
app.use("/api/admin/details", require("./routes/Admin Api/adminDetails"));
// Other Apis
app.use("/api/timetable", require("./routes/timetable"));
app.use("/api/material", require("./routes/material"));
app.use("/api/notice", require("./routes/notice"));
app.use("/api/subject", require("./routes/subject"));
app.use("/api/marks", require("./routes/marks"));
app.use("/api/department", require("./routes/department"));

// Quiz api
app.use("/api/quiz", verifyToken, require("./routes/Quiz Api/quiz"));
app.use("/api/question", require("./routes/Quiz Api/question"));
app.use("/api/answer", require("./routes/Quiz Api/answer"));

// Assignment api
app.use("/api/assignment", verifyToken, require("./routes/Assignment Api/assignment"));

app.listen(port, () => {
  console.log(`Server Listening On http://localhost:${port}`);
});
