const jwt = require("jsonwebtoken");
const JSON_SECRET = "key";

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(403)
      .json({ message: "Access denied, no token provided" });
  }
  const tokenWithoutBearer = token.split(" ")[1];
  console.log("Received token:", tokenWithoutBearer);

  try {
    const decoded = jwt.verify(tokenWithoutBearer, JSON_SECRET);
    console.log("Decoded token:", decoded);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
