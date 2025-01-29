import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      sparse: true, // allows null or undefined for Google and phone signups
    },
    password: {
      type: String,
      select: true,
    },
    isVerified: {
      type: Boolean,
      default: false, // For OTP and email verification
    },
    resetPasswordToken: {
      type: String, // Token for resetting the password
      select: true,
    },
    resetPasswordExpires: {
      type: Date, // Expiration time for the reset token
      select: false,
    }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;