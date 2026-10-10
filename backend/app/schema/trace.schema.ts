import mongoose, { Schema, model, type Model  } from "mongoose";

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
    userId:{
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    status: {
      type: String,
      enum: ["SUCCESS", "ERROR"],
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
const Trace: Model<any> =
  (mongoose.models.Trace as Model<any>) ||
  model<any>("Trace", traceSchema);

export default Trace;
