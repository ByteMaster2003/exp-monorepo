import mongoose from "mongoose";
import { ApiError, httpStatus } from "shared-utils";

import { AppConfig, Logger } from "../config/index.js";

const errorConverter = (err, _req, _res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;

    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, err.stack);
  }
  next(error);
};

const errorHandler = (err, req, res, _next) => {
  const { statusCode, message } = err;
  const response = {
    success: false,
    message
  };
  if (AppConfig.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.locals.errorMessage = err.message;
  const isObject = typeof err.stack === "object";

  Logger.error(
    "======================================== Error ========================================\n" +
      `Query: ${JSON.stringify(req.query)}\n` +
      `Params: ${JSON.stringify(req.params)}\n` +
      `Body: ${JSON.stringify(req.body)}\n\n` +
      `Message: ${JSON.stringify(err.message)}\n` +
      `${isObject ? JSON.stringify(err.stack, null, 2) : err.stack}\n`
  );
  res.status(statusCode).send(response);
};

export { errorConverter, errorHandler };
