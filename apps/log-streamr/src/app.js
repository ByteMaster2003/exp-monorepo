import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import ExpressMongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import { ApiError, httpStatus } from "shared-utils";

import { morganConfig, AppConfig } from "./config/index.js";
import { errorConverter, errorHandler } from "./middlewares/index.js";
import appRoutes from "./routes/v1/index.js";

const app = express();

app.use(morganConfig.errorHandler);
app.use(morganConfig.successHandler);

// parse json request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// parse cookies
app.use(cookieParser());

// sanitize request data
app.use(ExpressMongoSanitize());

// enable cors
app.use(
  cors({
    origin: AppConfig.ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-refresh-token"],
    credentials: true
  })
);

// set security HTTP headers
app.use(helmet());

// Enable trust proxy
app.set("trust proxy", 1);

// v1 api routes
app.use("/v1", appRoutes);

// send back a 404 error for any unknown api request
app.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
