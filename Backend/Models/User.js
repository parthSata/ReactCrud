import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  age: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String, default: null },
});


export const User = mongoose.model("User", userSchema);
