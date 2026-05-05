import { randomUUID } from "crypto";
import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { matchedData } from "express-validator";
import type { Filter } from "mongodb";
import {
  buildPaginatorView,
  parsePaginationQuery,
  type PaginatorView,
} from "../../_shared/pagination";
import { postCreateForBlogValidators } from "../../posts/posts.validation";
import type { PostView } from "../../posts/types/post";
import { toPostView } from "../../posts/utils/to-post-view";
import type { BlogDocument } from "../../../db/documents";
import { blogsCollection, postsCollection } from "../../../db/mongo";
import { requireBasicAuth } from "../../../middleware/basic-auth.middleware";
import { sendValidationErrors } from "../../../middleware/validation.middleware";
import { blogCreateValidators, blogUpdateValidators } from "../blogs.validation";
import type { BlogView } from "../types/blog";
import { toBlogView } from "../utils/map-blog";

export const blogsRouter = Router();

blogsRouter.get(
  "/",
  async (
    req: Request,
    res: Response<PaginatorView<BlogView>>,
    next: NextFunction,
  ) => {
    try {
      const { pageNumber, pageSize, sortBy, sortDirection } = parsePaginationQuery(
        req,
        {
          defaultSortBy: "createdAt",
          allowedSortBy: ["createdAt", "name", "description", "websiteUrl", "id"],
        },
      );
      const searchNameTerm =
        typeof req.query.searchNameTerm === "string"
          ? req.query.searchNameTerm.trim()
          : "";
      const filter: Filter<BlogDocument> = searchNameTerm
        ? { name: { $regex: searchNameTerm, $options: "i" } }
        : {};

      const docs = await blogsCollection()
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .toArray();
      const totalCount = await blogsCollection().countDocuments(filter);
      res.status(200).send(
        buildPaginatorView(docs.map(toBlogView), totalCount, pageNumber, pageSize),
      );
    } catch (err) {
      next(err);
    }
  },
);

blogsRouter.get(
  "/:blogId/posts",
  async (
    req: Request<{ blogId: string }>,
    res: Response<PaginatorView<PostView>>,
    next: NextFunction,
  ) => {
    try {
      const blog = await blogsCollection().findOne({ id: req.params.blogId });
      if (!blog) {
        res.sendStatus(404);
        return;
      }

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
        .find({ blogId: req.params.blogId })
        .sort({ [sortBy]: sortDirection })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .toArray();
      const views = await Promise.all(docs.map((doc) => toPostView(doc)));
      const totalCount = await postsCollection().countDocuments({
        blogId: req.params.blogId,
      });

      res
        .status(200)
        .send(buildPaginatorView(views, totalCount, pageNumber, pageSize));
    } catch (err) {
      next(err);
    }
  },
);

blogsRouter.post(
  "/:blogId/posts",
  requireBasicAuth,
  postCreateForBlogValidators,
  sendValidationErrors,
  async (
    req: Request<{ blogId: string }>,
    res: Response<PostView>,
    next: NextFunction,
  ) => {
    try {
      const blog = await blogsCollection().findOne({ id: req.params.blogId });
      if (!blog) {
        res.sendStatus(404);
        return;
      }

      const { title, shortDescription, content } = matchedData<{
        title: string;
        shortDescription: string;
        content: string;
      }>(req, { locations: ["body"] });

      const doc = {
        id: randomUUID(),
        title,
        shortDescription,
        content,
        blogId: req.params.blogId,
        createdAt: new Date(),
      };
      await postsCollection().insertOne(doc);
      res.status(201).send(await toPostView(doc));
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
