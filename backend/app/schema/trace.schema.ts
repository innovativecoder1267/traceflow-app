import mongoose, { Schema, model, type Model  } from "mongoose";

const traceSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
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
    },

    endedAt: {
      type: Date,
    },

    duration: {
      type: Number,
    },
    userId:{
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    

  spans: [
  {
    name: {
      type: String,
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    duration: {
      type: Number,
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
