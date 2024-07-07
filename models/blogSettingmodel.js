const mongoose = require("mongoose");
const User = require('./userModel');

const blogSettingschema = mongoose.Schema({
  blog_title: {
    type: String,
    required: true,
  },
  blog_media: {
    type: String,
    required: true,
  },
  blog_description: {
    type: String,
    required: true,
  },
  blog_category: {
    type: String,
    required: true,
  },
  userId: {
    type: String, // Use String type to match the type in userModel
    ref: 'User',
  },
  username: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      text: String,
    },
  ]
});


blogSettingschema.pre("save", async function (next) {
  if (this.isNew) {
    // If it's a new blog, fetch the associated user and set userId and username
    const user = await User.findById(this.userId);
    if (user) {
      this.userId = user.userId;
      this.username = user.firstName;
    }
  }
  next();
});

module.exports = mongoose.model('Blog', blogSettingschema);
