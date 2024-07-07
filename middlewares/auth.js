const jwt = require("jsonwebtoken");
const config = require("../config/configkey");

const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token found');
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, config.SECRET_KEY);
    req.user = decoded; 
    console.log('Decoded token:', decoded); // Add this line for debugging
    next();
  } catch (err) {
    console.error('Error verifying token:', err);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }

    return res.status(401).json({ error: 'User not authenticated' });
  }
};

module.exports = verifyToken;
