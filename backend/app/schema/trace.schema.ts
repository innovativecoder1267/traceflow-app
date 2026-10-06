import mongoose, { Schema, model } from "mongoose";

interface ITrace {
  projectId: mongoose.Types.ObjectId;
  id?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  startedAt: Date;
  endedAt: Date;
  duration: number;
  userId: mongoose.Types.ObjectId;

  spans: {
    name: string;
    startedAt: Date;
    endedAt: Date;
    duration: number;
    status?: "SUCCESS" | "ERROR";
    metadata?: Record<string, unknown>;
  }[];
}

const traceSchema = new Schema<ITrace>(
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

    userId: {
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

const Trace =
  mongoose.models.trace ||
  model<ITrace>("trace", traceSchema);

export default Trace;
