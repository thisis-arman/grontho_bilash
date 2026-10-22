/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import config from "../config";
import AppError from "../errors/AppError";
import handleCastError from "../errors/handleCastError";
import handleDuplicateError from "../errors/handleDuplicateError";
import handleValidationError from "../errors/handleValidationError";
import handleZodError from "../errors/handleZodError";
import { TErrorSources } from "../interface/error";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // setting default values
  let statusCode = 500;
  let message = "কিছু একটা সমস্যা হয়েছে! অনুগ্রহ করে আবার চেষ্টা করো।";
  let errorSources: TErrorSources = [
    {
      path: "",
      message: "কিছু একটা সমস্যা হয়েছে",
    },
  ];

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === "ValidationError") {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === "CastError") {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err?.message,
      },
    ];
  } else if (err instanceof Error && err.constructor === Error) {
    // Services throw bare Errors for expected failures ("Password do not
    // matched", "Insufficient stock", ...), so these are client errors.
    statusCode = 400;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err?.message,
      },
    ];
  } else if (err instanceof Error) {
    // Anything else (driver errors, TypeErrors, ...) is unexpected: log it,
    // and don't leak internals to the client in production.
    console.error(err);
    if (!config.is_production) {
      message = err.message;
      errorSources = [{ path: "", message: err.message }];
    }
  }

  if (res.headersSent) return next(err);

  // ultimate return
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.is_production ? null : err?.stack,
  });
};

export default globalErrorHandler;
