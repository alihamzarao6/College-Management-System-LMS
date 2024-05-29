const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // const token = req.cookies.access_token;
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];


  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - No token provided" });
  }

  jwt.verify(token, "MY_JWT_SECRET_KEY", (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - Invalid token" });
    }

    req.user = decoded; // Set the user information in the request object
    next();
  });
};

module.exports = verifyToken;
