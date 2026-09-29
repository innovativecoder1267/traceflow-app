import mongoose, { Schema, model } from "mongoose";

const traceSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    id: {
      type: String,
      unique: true,
    },

    method: {
      type: String,
 
    },

    path: {
      type: String,
    },

    statusCode: {
      type: Number,
    },

    startedAt: {
      type: Date,
      required: true,
    },

    endedAt: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "ERROR"],
     },

    spans: [
  {
    name: {
      type: String,
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
],
  },
  {
    timestamps: true,
  }
);
const Trace: mongoose.Model<any> = mongoose.models.trace || model("trace",traceSchema);
export default Trace;
