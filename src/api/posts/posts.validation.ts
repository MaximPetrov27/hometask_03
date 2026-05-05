import { body } from "express-validator";
import { blogsCollection } from "../../db/mongo";

export const postCreateValidators = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("title is required")
    .bail()
    .isLength({ max: 30 })
    .withMessage("title is too long"),
  body("shortDescription")
    .trim()
    .notEmpty()
    .withMessage("shortDescription is required")
    .bail()
    .isLength({ max: 100 })
    .withMessage("shortDescription is too long"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("content is required")
    .bail()
    .isLength({ max: 1000 })
    .withMessage("content is too long"),
  body("blogId")
    .trim()
    .notEmpty()
    .withMessage("blogId is required")
    .bail()
    .custom(async (value: string) => {
      const found = await blogsCollection().findOne({ id: value });
      if (!found) {
        throw new Error("blog for blogId not found");
      }
      return true;
    }),
];

export const postUpdateValidators = postCreateValidators;
