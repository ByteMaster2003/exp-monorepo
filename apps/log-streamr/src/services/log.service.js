import { LogsModel } from "db-services/models/index.js";

const createLog = async (data) => {
  let logs;
  if (Array.isArray(data)) {
    logs = await LogsModel.insertMany(data);
  } else {
    logs = await LogsModel.create(data);
  }

  return logs;
};

export default { createLog };
