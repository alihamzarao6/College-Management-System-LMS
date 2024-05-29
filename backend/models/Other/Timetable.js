const mongoose = require("mongoose");

const TimeTable = new mongoose.Schema(
  {
    link: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Timetable", TimeTable);
