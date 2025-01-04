import mongoose from 'mongoose';
import anonymousMessageSchema from './anonymousMessageSchema.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: [true, `Username already exists`],
    minlength: [5, 'Username must be at least 5 characters long'],
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: [5, 'Password must be at least 5 characters long'],
  },
  email: {
    type: String,
    required: false,
    unique: [true, `Email already exists`], // Ensures email is unique
    sparse: true, // Avoids conflicts for null values
    default: () => `fallback_${uuidv4()}@example.com`, // Generate fallback email
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  uniqueString: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    required: true,
    match: [
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      'Please input a valid string',
    ],
  },
  userDate: { type: Date, default: Date.now },
  expirationHours: {
    type: Number,
    default: 3, // Default to 3 hours if not provided
    enum: [1, 2, 3, 4], // Ensure only valid options are allowed
  },
  expiresAt: {
    type: Date,
  },
  messages: [anonymousMessageSchema],
});

// Middleware to calculate expiresAt dynamically
userSchema.pre('save', async function (next) {
  // Set expiresAt based on expirationHours
  if (!this.expiresAt) {
    this.expiresAt = new Date(
      Date.now() + this.expirationHours * 60 * 60 * 1000
    );
  }

  // Hash the password if it has been modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

// Method to create JWT
userSchema.methods.createJwt = function () {
  return jwt.sign(
    { userId: this._id, name: this.username },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

// Method to compare passwords
userSchema.methods.comparePassword = async function (inPassword) {
  return await bcrypt.compare(inPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
