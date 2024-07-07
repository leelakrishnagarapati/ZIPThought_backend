const express = require('express');
const blogController = require('../controllers/blogController');
const router = express.Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const configkey = require('../config/configkey')

const extractUser = (req, res, next) => {
  // Check if the Authorization header is present
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('No Authorization header or incorrect format');
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decodedToken = jwt.verify(token, configkey.SECRET_KEY);
    
    if (!decodedToken) {
      console.error('Failed to decode token');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Make sure req.user is an object
    req.user = decodedToken || {};
    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    res.status(401).json({ error: 'User not authenticated' });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './public/images');
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });
// Create a new blog 
router.post('/create',extractUser, blogController.createBlog);

// Get all blogs 
router.get('/', blogController.getAllBlogs);

// Get all blogs according Category
router.get('/category/:category', blogController.getBlogsByCategory);

// Endpoint to get blogs for a specific user
router.get('/user/:userId', blogController.getUserBlogs);

// Get a single blog by ID
router.get('/:id', blogController.getBlogById);

// Update a blog by ID
router.put('/:id', blogController.updateBlog);

// Delete a blog by ID
router.delete('/:id', blogController.deleteBlog);

// Define a route for image uploads with a callback function
router.post("/upload", upload.single('file'), blogController.uploadImage); 


//To count No of blogs Published
router.get('/count', blogController.getBlogCount);


module.exports = router;
