// const mongoose = require('mongoose');
import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config({ path: './.env' });
mongoose.set('debug', true);
  

const DB = process.env.DB_URI.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
  

const connectDB = async () => {
  try { 
    await mongoose.connect(DB, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Could not connect to MongoDB', err);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
