const Blog = require('../models/blogSettingmodel');
const User = require('../models/userModel')
const multer = require('multer');
const jwt = require('jsonwebtoken');
const configkey = require('../config/configkey');



const createBlog = async (req, res) => {
  try {
    const { blog_title, blog_description, blog_media, blog_category } = req.body;

    // Extract userId and firstName from the token
    const { userId, firstName } = req.user;

    const newBlog = new Blog({
      blog_title,
      blog_description,
      blog_media,
      blog_category,
      userId,
      username: firstName,
    });

    const savedBlog = await newBlog.save();

    res.status(201).json(savedBlog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error getting all blogs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getUserBlogs = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch blogs where userId matches the requested userId
    const blogs = await Blog.find({ userId: userId });

    res.json(blogs);
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getBlogById = async (req, res) => {
  const { id } = req.params;

  // Check if the ID is 'count'
  if (id === 'count') {
    // Handle count logic
    try {
      const count = await Blog.countDocuments({ isPublished: true });
      return res.json({ count });
    } catch (error) {
      console.error('Error getting blog count:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Handle normal blog retrieval by ID
  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Error getting blog by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateBlog = async (req, res) => {
  const { blog_title, blog_description, blog_media } = req.body;
  const { id } = req.params;

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { blog_title, blog_description, blog_media },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const uploadImage = (req, res) => {
  try {
    const imageUrl = `/images/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('File upload failed:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
};

const extractUser = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, configkey.SECRET_KEY);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    res.status(401).json({ error: 'User not authenticated' });
  }
};


//to Display all blog according Category
const getBlogsByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const blogs = await Blog.find({ blog_category: category });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getBlogCount = async (req, res) => {
  try {
    const countResult = await Blog.aggregate([
      {
        $match: { isPublished: true },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    // Check if the result is not empty and has the 'count' field
    const count = countResult.length > 0 ? countResult[0].count : 0;

    res.json({ count });
  } catch (error) {
    console.error('Error getting blog count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




module.exports = {
  createBlog,
  getAllBlogs,
  getUserBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  uploadImage,
  extractUser,
  getBlogsByCategory,
  getBlogCount
};
