import { Schema, model } from "mongoose";
import mongoose from "mongoose";
const projectSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    apiKey: {
      type: String,
      unique: true,
      required: true
    },

    status: {
      type: String,
      enum: ["ACTIVE", "REVOKED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);
const Project=mongoose.models.Project || model("Project", projectSchema);
export default Project
