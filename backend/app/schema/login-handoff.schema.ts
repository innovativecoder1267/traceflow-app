import mongoose, { Schema, model } from "mongoose";

const loginHandoffSchema = new Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

const LoginHandoff =
  mongoose.models.LoginHandoff ||
  model("LoginHandoff", loginHandoffSchema);

export default LoginHandoff;
