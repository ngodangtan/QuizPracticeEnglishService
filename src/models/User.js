/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - fullName
 *         - username
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         fullName:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           description: Hashed password (not returned in responses)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  console.log('Pre-save hook triggered, isModified:', this.isModified('password'));
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hash');
    return;
  }

  // If password already looks like a bcrypt hash, skip hashing to avoid double-hash
  if (typeof this.password === 'string' && this.password.startsWith('$2')) {
    console.log('Password already hashed, skipping hash');
    return;
  }

  console.log('Hashing password...');
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
  } catch (error) {
    console.log('Error hashing password:', error);
    throw error;
  }
});

// Method to compare password
userSchema.methods.comparePassword = function(candidatePassword) {
  console.log('Comparing passwords...');
  console.log('Stored password length:', this.password.length);
  console.log('Candidate password:', candidatePassword);
  try {
    const isMatch = bcrypt.compareSync(candidatePassword, this.password);
    console.log('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.log('Error comparing passwords:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);