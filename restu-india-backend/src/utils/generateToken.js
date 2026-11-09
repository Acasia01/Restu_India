const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT containing the user's id.
 * @param {string} id - Mongo ObjectId of the user
 * @returns {string} signed JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

module.exports = generateToken;
