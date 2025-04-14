import { Schema, model } from "mongoose";

import { paginate, toJSON } from "../plugins/index.js";

const logSchema = new Schema(
  {
    project: {
      type: String,
      require: true
    },
    timestamp: {
      type: Date,
      require: true
    },
    level: {
      type: String,
      enum: ["info", "error", "debug", "warn"],
      require: true
    },
    message: {
      type: String,
      require: true
    },
    query: String,
    params: String,
    body: String,
    stack: String
  },
  {
    timestamps: true
  }
);

logSchema.plugin(toJSON);
logSchema.plugin(paginate);
logSchema.index({
  project: 1,
  timestamp: 1,
  level: 1
});

export const LogsModel = model("logs", logSchema);
