const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const configkey = require('../config/configkey');

exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email }); 
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({ firstName, lastName, email, password });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while retrieving users' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, configkey.SECRET_KEY, {
      expiresIn: '1h',
    });

    res.status(200).json({ token, user: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




exports.logoutUser = (req, res) => {
  res.redirect('/login');
  res.status(200).json({ message: 'Logout successful' });
};

exports.uploadProfilePic = async (req, res) => {
  try {
    const userId = req.body.userId;

    // If the user uploaded a file, handle it; otherwise, use the default profile picture
    let fileUrl;
    if (req.file) {
      // Handle file upload
      const fileName = req.file.filename;
      fileUrl = `public/profilepics/${fileName}`;

      // the user's profilePic field in the database 
      const updatedUser = await User.findOneAndUpdate(
        { userId: userId },
        { $set: { profilePic: fileUrl } },
        { new: true }
      );

      res.json({ user: updatedUser, fileUrl });
    } else {
      // the default profile picture
      fileUrl = '/profilepics/default.jpeg'; 

      // the user's profilePic field in the database with the default file URL
      const updatedUser = await User.findOneAndUpdate(
        { userId: userId },
        { $set: { profilePic: fileUrl } },
        { new: true }
      );

      res.json({ user: updatedUser, fileUrl });
    }
  } catch (error) {
    console.error('Error updating user profile picture:', error);
    res.status(500).json({ error: 'Error updating user profile picture.' });
  }
};



// Controller to update user data
exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const updatedData = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { userId: userId },
      { $set: updatedData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getUserProfilePic = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ userProfilePic: user.profilePic });
  } catch (error) {
    console.error('Error getting user profile picture:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by userId
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Perform the deletion using the User model
    await User.deleteOne({ userId });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments({ role: 'user' });
    console.log('User count:', count); 
    res.json({ count });
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.resetPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    // Check if the user with the provided email exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Generate a password reset token 
    const resetToken = generateResetToken();

    // Save the reset token to the user in the database
    user.resetToken = resetToken;
    await user.save();

    // Send a password reset email to the user
    await sendPasswordResetEmail(user.email, resetToken);

    // Return a success message
    res.json({ message: 'Password reset email sent successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
// Function to generate a unique reset token (You need to implement this function)
function generateResetToken() {
  const randomString = Math.random().toString(36).slice(2);
  return randomString;
}
