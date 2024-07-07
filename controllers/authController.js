
const users = {}; // user data store 

const authController = {

  signupUser: (req, res) => {
    // Implement user signup logic, and store user data
    const { name, email } = req.body;
    const userId = generateUserId(); //generate a unique user ID
    users[userId] = { name, email, id: userId };

    // Return the user's ID in the response
    res.json({ id: userId });
  },

  getUserProfile: (req, res) => {
    if (!req.isAuthenticated) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Retrieve user data based on the token
    const userId = req.userId; // Assuming you set the user ID during login
    const user = users[userId];

    // Return user data
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  },
};

module.exports = authController;
