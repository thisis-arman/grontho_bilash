import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import catchAsync from "../utils/catchAsync";

const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Use the parsed result, not the raw body: unknown fields are dropped and
    // transforms (trimming, lower-casing emails) actually take effect.
    req.body = await schema.parseAsync(req.body);
    next();
  });
};

export default validateRequest;
