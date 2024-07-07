const express = require('express');
const userController = require('../controllers/userController');
const multer = require('multer');

const router = express.Router();

// Set up multer storage for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/profilepics');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
  }
});

const upload = multer({ storage: storage });

// POST route for user registration
router.post('/register', userController.registerUser);

// GET route to retrieve user data
router.get('/', userController.getUser);

//  to delete user data
router.delete('/:userId', userController.deleteUser);

// POST route for user login
router.post('/login', userController.loginUser);

// POST route for user logout
router.post('/logout', userController.logoutUser);

// Endpoint to get user data by userId
router.get('/:userId', userController.getUserById);

// POST route to upload profile picture
router.post('/uploadProfilePic', upload.single('file'), userController.uploadProfilePic);

router.get('/:userId/profilepic', userController.getUserProfilePic);

// Example updated route
router.put('/:userId', userController.updateUser);

// To count No of user Register
router.get('/users/count', userController.getUserCount);



module.exports = router;
