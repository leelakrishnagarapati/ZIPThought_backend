// index.js
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const userRoute = require('./routes/userRoute');
const cors = require('cors');
const authRoutes = require('./routes/authRoute');
const blogRoutes = require('./routes/blogRoute'); // Updated import
const path = require('path');

// Mongoose
mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://raghukiran188:12345@cluster0.su5iqsf.mongodb.net/bp_db');
var db = mongoose.connection;
db.on('open', () => console.log('Connected to DB'));
db.on('error', () => console.log('Error occurred'));

// Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));



// Routes
app.use('/users', userRoute);
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);




app.listen(4000, () => {
  console.log('Server started at 4000');
});
