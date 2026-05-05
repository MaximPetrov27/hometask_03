import { body } from "express-validator";

export const WEBSITE_URL_PATTERN =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

export const blogCreateValidators = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .bail()
    .isLength({ max: 15 })
    .withMessage("name is too long"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("description is required")
    .bail()
    .isLength({ max: 500 })
    .withMessage("description is too long"),
  body("websiteUrl")
    .trim()
    .notEmpty()
    .withMessage("websiteUrl is required")
    .bail()
    .isLength({ max: 100 })
    .withMessage("website url is too long")
    .bail()
    .matches(WEBSITE_URL_PATTERN)
    .withMessage("website url does not match the template"),
];

export const blogUpdateValidators = blogCreateValidators;
