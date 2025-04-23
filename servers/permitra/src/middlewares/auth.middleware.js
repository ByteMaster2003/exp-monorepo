import { ApiError, catchAsync, httpStatus } from "shared-utils";

import { tokenUtil, encryptionUtil } from "../utils/index.js";

export const verifyAccess = catchAsync(async (req, _res, next) => {
  const accessToken = req.cookies.accessToken || req.headers?.authorization?.replace("Bearer ", "");

  if (!accessToken) throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid access token");

  const payload = await tokenUtil.verifyAccessToken(accessToken);
  const jsonString = encryptionUtil.decrypt(payload.data);
  const jsonObject = JSON.parse(jsonString);

  req.user = jsonObject;
  next();
});
