import { Schema, model } from "mongoose";

import { paginate, toJSON } from "../plugins/index.js";

const logSchema = new Schema(
  {
    project: {
      type: String,
      require: true
    },
    logType: {
      type: String,
      enum: ["appLog", "socketLog"],
      default: "appLog"
    },
    level: {
      type: String,
      enum: ["info", "error", "debug", "warn"],
      require: true
    },
    timestamp: {
      type: Date,
      require: true
    },
    message: {
      type: String,
      require: true
    }
  },
  {
    timestamps: true
  }
);

logSchema.plugin(toJSON);
logSchema.plugin(paginate);
logSchema.index({
  project: 1,
  logType: 1,
  level: 1,
  timestamp: 1
});

export const LogsModel = model("logs", logSchema);
