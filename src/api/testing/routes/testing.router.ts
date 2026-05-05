import { Router, type NextFunction } from "express";
import { clearAllCollections } from "../../../db/mongo";

export const testingRouter = Router();

testingRouter.delete(
  "/all-data",
  async (_req, res, next: NextFunction) => {
    try {
      await clearAllCollections();
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
);
