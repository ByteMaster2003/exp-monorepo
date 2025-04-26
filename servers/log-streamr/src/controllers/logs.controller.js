import { LogsModel } from "db-services/models";
import { catchAsync, httpStatus } from "shared-utils";

const queryLogs = catchAsync(async (req, res) => {
  const { page, limit, timestamp, project } = req.query;

  const filter = { project };
  if (timestamp) filter.timestamp = { $lte: timestamp };

  const options = {
    page,
    limit,
    toJSON: true
  };
  const result = await LogsModel.paginate(filter, options);

  return res.status(httpStatus.OK).json({
    success: true,
    data: result
  });
});

export default { queryLogs };
