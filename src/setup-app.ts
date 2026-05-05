import express, { type Express } from "express";
import { blogsRouter } from "./api/blogs/routes/blogs.router";
import { postsRouter } from "./api/posts/routes/posts.router";
import { testingRouter } from "./api/testing/routes/testing.router";

export const setupApp = (app: Express): Express => {
  app.use(express.json());

  app.use("/hometask_03/api/blogs", blogsRouter);
  app.use("/hometask_03/api/posts", postsRouter);
  app.use("/hometask_03/api/testing", testingRouter);

  app.use("/blogs", blogsRouter);
  app.use("/posts", postsRouter);
  app.use("/testing", testingRouter);

  app.get("/", (_req, res) => {
    res.status(200).send("hw03");
  });

  return app;
};
