const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const shortid = require("shortid");

const userSchema = mongoose.Schema({
  userId: {
    type: String,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
  profilePic: {
    type: String ,// Store the image filename here
    default:"/public/profilepics/default.jpeg"
  },
  mobileNumber: {
    type: String,
  },
  description: {
    type: String,
  }
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.userId) {
    // Generate userId only if not provided (during registration)
    user.userId = "User-" + shortid.generate();
  }
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
