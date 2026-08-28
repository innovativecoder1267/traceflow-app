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
        type: Schema.Types.ObjectId,
        ref: "Span",
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Trace=mongoose.models.trace|| model("trace",traceSchema)
export default Trace