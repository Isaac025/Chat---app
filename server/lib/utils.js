const jwt = require("jsonwebtoken");

//func to generate token for user

const generateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  return token;
};

module.exports = { generateToken };
