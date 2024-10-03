import { Request, Response } from "express";
import { userServices } from "./user.services";

const createUser = (req: Request, res: Response) => {
  const result = userServices.createUserIntoDB(req.body);

  res.json({
    success: true,
    statusCode: 200,
    message: "User created successfully",
    data: result,
  });
};


export const userControllers = {
  createUser,
};
