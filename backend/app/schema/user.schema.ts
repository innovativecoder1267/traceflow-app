import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false
    },
    otp:{
      type:String,
      required:true
    },
    otpexpiry:{
      type:Date,
      required:true
    }
  },
  {
    timestamps: true,
  }
);
const User = (mongoose.models.User as mongoose.Model<any>) || model("User", userSchema);

export default User;