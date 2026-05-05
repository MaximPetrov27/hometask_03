import { validationResult } from "express-validator";
import type { NextFunction, Request, Response } from "express";

export function sendValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  const errorsMessages = result.array({ onlyFirstError: true }).map((err) => ({
    message: err.msg,
    field: err.type === "field" ? err.path : String(err.type),
  }));

  res.status(400).send({ errorsMessages });
}
