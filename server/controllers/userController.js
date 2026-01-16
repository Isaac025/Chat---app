const bcrypt = require("bcryptjs");
const USER = require("../models/user");
const { generateToken } = require("../lib/utils");
const cloudinary = require("../lib/cloudinary");

// signup user
const signUp = async (req, res) => {
  const { fullName, email, password, bio } = req.body;
  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required" });
  }
  try {
    const user = await USER.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, error: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);

    const newUser = await USER.create({
      fullName,
      email,
      password: hashedpassword,
      bio,
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      userData: {
        newUser,
        token,
        message: "Account created successfully",
      },
    });
  } catch (error) {
    console.error("Sign up error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await USER.findOne({ email });
    if (!userData) {
      return res
        .status(400)
        .json({ success: false, error: "User doesn't exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid email or password" });
    }

    const token = generateToken(userData._id);

    res.status(200).json({
      success: true,
      userData,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//controller to check if user is authenticated
const checkAuth = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// controller to update user profile details
const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;

    const userId = req.user._id;

    let updatedUser;

    if (!profilePic) {
      updatedUser = await USER.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await USER.findByIdAndUpdate(
        userId,
        { bio, fullName, profilePic: upload.secure_url },
        { new: true } // Return the updated document, not the old one
      );
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  signUp,
  login,
  checkAuth,
  updateProfile,
};
