import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: [true, 'password is required']
  },

  // 🔹 ADMIN PANEL KE LIYE ADD KIYA GAYA FIELD
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },

  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }
  ],

  sales: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale"
    }
  ],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
