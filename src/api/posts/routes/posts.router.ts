import { randomUUID } from "crypto";
import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { matchedData } from "express-validator";
import {
  buildPaginatorView,
  parsePaginationQuery,
  type PaginatorView,
} from "../../_shared/pagination";
import { postsCollection } from "../../../db/mongo";
import { requireBasicAuth } from "../../../middleware/basic-auth.middleware";
import { sendValidationErrors } from "../../../middleware/validation.middleware";
import { postCreateValidators, postUpdateValidators } from "../posts.validation";
import type { PostView } from "../types/post";
import { toPostView } from "../utils/to-post-view";

export const postsRouter = Router();

postsRouter.get(
  "/",
  async (
    req: Request,
    res: Response<PaginatorView<PostView>>,
    next: NextFunction,
  ) => {
    try {
      const { pageNumber, pageSize, sortBy, sortDirection } = parsePaginationQuery(
        req,
        {
          defaultSortBy: "createdAt",
          allowedSortBy: [
            "createdAt",
            "title",
            "shortDescription",
            "content",
            "blogId",
            "id",
          ],
        },
      );
      const docs = await postsCollection()
        .find({})
        .sort({ [sortBy]: sortDirection })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .toArray();
      const views = await Promise.all(docs.map((d) => toPostView(d)));
      const totalCount = await postsCollection().countDocuments({});
      res
        .status(200)
        .send(buildPaginatorView(views, totalCount, pageNumber, pageSize));
    } catch (err) {
      next(err);
    }
  },
);

postsRouter.get(
  "/:id",
  async (
    req: Request<{ id: string }>,
    res: Response<PostView>,
    next: NextFunction,
  ) => {
    try {
      const doc = await postsCollection().findOne({ id: req.params.id });
      if (!doc) {
        res.sendStatus(404);
        return;
      }
      res.status(200).send(await toPostView(doc));
    } catch (err) {
      next(err);
    }
  },
);

postsRouter.post(
  "/",
  requireBasicAuth,
  postCreateValidators,
  sendValidationErrors,
  async (req: Request, res: Response<PostView>, next: NextFunction) => {
    try {
      const { title, shortDescription, content, blogId } = matchedData<{
        title: string;
        shortDescription: string;
        content: string;
        blogId: string;
      }>(req, { locations: ["body"] });

      const id = randomUUID();
      const createdAt = new Date();
      const doc = {
        id,
        title,
        shortDescription,
        content,
        blogId,
        createdAt,
      };
      await postsCollection().insertOne(doc);
      res.status(201).send(await toPostView(doc));
    } catch (err) {
      next(err);
    }
  },
);

postsRouter.put(
  "/:id",
  requireBasicAuth,
  postUpdateValidators,
  sendValidationErrors,
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const post = await postsCollection().findOne({ id: req.params.id });
      if (!post) {
        res.sendStatus(404);
        return;
      }

      const { title, shortDescription, content, blogId } = matchedData<{
        title: string;
        shortDescription: string;
        content: string;
        blogId: string;
      }>(req, { locations: ["body"] });

      await postsCollection().updateOne(
        { id: req.params.id },
        {
          $set: {
            title,
            shortDescription,
            content,
            blogId,
          },
        },
      );
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
);

postsRouter.delete(
  "/:id",
  requireBasicAuth,
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const result = await postsCollection().deleteOne({ id: req.params.id });
      if (result.deletedCount === 0) {
        res.sendStatus(404);
        return;
      }
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
);
