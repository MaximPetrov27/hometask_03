import { randomUUID } from "crypto";
import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { matchedData } from "express-validator";
import { blogsCollection, postsCollection } from "../../../db/mongo";
import { requireBasicAuth } from "../../../middleware/basic-auth.middleware";
import { sendValidationErrors } from "../../../middleware/validation.middleware";
import { blogCreateValidators, blogUpdateValidators } from "../blogs.validation";
import type { BlogView } from "../types/blog";
import { toBlogView } from "../utils/map-blog";

export const blogsRouter = Router();

blogsRouter.get(
  "/",
  async (_req: Request, res: Response<BlogView[]>, next: NextFunction) => {
    try {
      const docs = await blogsCollection()
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.status(200).send(docs.map(toBlogView));
    } catch (err) {
      next(err);
    }
  },
);

blogsRouter.get(
  "/:id",
  async (
    req: Request<{ id: string }>,
    res: Response<BlogView>,
    next: NextFunction,
  ) => {
    try {
      const doc = await blogsCollection().findOne({ id: req.params.id });
      if (!doc) {
        res.sendStatus(404);
        return;
      }
      res.status(200).send(toBlogView(doc));
    } catch (err) {
      next(err);
    }
  },
);

blogsRouter.post(
  "/",
  requireBasicAuth,
  blogCreateValidators,
  sendValidationErrors,
  async (req: Request, res: Response<BlogView>, next: NextFunction) => {
    try {
      const { name, description, websiteUrl } = matchedData<{
        name: string;
        description: string;
        websiteUrl: string;
      }>(req, { locations: ["body"] });

      const id = randomUUID();
      const createdAt = new Date();
      const doc = {
        id,
        name,
        description,
        websiteUrl,
        createdAt,
        isMembership: false,
      };
      await blogsCollection().insertOne(doc);
      res.status(201).send(toBlogView(doc));
    } catch (err) {
      next(err);
    }
  },
);

blogsRouter.put(
  "/:id",
  requireBasicAuth,
  blogUpdateValidators,
  sendValidationErrors,
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const existing = await blogsCollection().findOne({ id: req.params.id });
      if (!existing) {
        res.sendStatus(404);
        return;
      }

      const { name, description, websiteUrl } = matchedData<{
        name: string;
        description: string;
        websiteUrl: string;
      }>(req, { locations: ["body"] });

      await blogsCollection().updateOne(
        { id: req.params.id },
        {
          $set: {
            name,
            description,
            websiteUrl,
          },
        },
      );
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
);

blogsRouter.delete(
  "/:id",
  requireBasicAuth,
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const blog = await blogsCollection().findOne({ id: req.params.id });
      if (!blog) {
        res.sendStatus(404);
        return;
      }
      await postsCollection().deleteMany({ blogId: req.params.id });
      await blogsCollection().deleteOne({ id: req.params.id });
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
);
