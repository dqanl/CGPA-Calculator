import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const anonymousMessageSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, 'characters must be greater than ten'],
    maxlength: [250, 'characters must be less than 200'],
  },
  timestamp: { type: Date, default: Date.now },
});

export default anonymousMessageSchema;
