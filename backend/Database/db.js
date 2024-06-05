const mongoose = require("mongoose");

const connectToMongo = () => {
  mongoose
    .connect(
      "mongodb+srv://mainlmsuser1:lOU359Xg0cA5lQEC@cluster0.nzhcf37.mongodb.net/lms?retryWrites=true&w=majority&appName=Cluster0",
      { useNewUrlParser: true }
    )
    .then(() => {
      console.log("Connected to MongoDB Successfully");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB", error);
    });
};

module.exports = connectToMongo;
