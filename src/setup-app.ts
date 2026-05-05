import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { blogsRouter } from "./api/blogs/routes/blogs.router";
import { postsRouter } from "./api/posts/routes/posts.router";
import { testingRouter } from "./api/testing/routes/testing.router";
import { ensureMongoReady } from "./db/mongo";

export const setupApp = (app: Express): Express => {
  app.use(express.json());

  app.use(async (_req: Request, _res: Response, next: NextFunction) => {
    try {
      await ensureMongoReady();
      next();
    } catch (err) {
      next(err);
    }
  });

  app.use("/hometask_03/api/blogs", blogsRouter);
  app.use("/hometask_03/api/posts", postsRouter);
  app.use("/hometask_03/api/testing", testingRouter);
  app.use("/hometask_04/api/blogs", blogsRouter);
  app.use("/hometask_04/api/posts", postsRouter);
  app.use("/hometask_04/api/testing", testingRouter);

  app.use("/blogs", blogsRouter);
  app.use("/posts", postsRouter);
  app.use("/testing", testingRouter);

  app.get("/", (_req, res) => {
    res.status(200).send("hw03");
  });

  return app;
};
