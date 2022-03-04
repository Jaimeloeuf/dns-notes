/**
 * Utility module to build request body validation middlewares,
 * using generated standalone AJV validation modules.
 */

import type { ValidateFunction } from "ajv";
import type { RequestHandler } from "express";

/**
 * Create a validation middleware using AJV schema
 * Not used for now as pre-generated standalone modules preferred
 */
// function validateBodyWithSchema(schema: object): RequestHandler {
//   const Ajv = require("ajv");
//   const ajv = new Ajv();

//   const validate = ajv.compile(schema);
//   return (req, res, next) =>
//     validate(req.body) ? next() : res.status(400).json(validate.errors);
// }

/**
 * Run a single validation function against the request body as a middleware
 */
export const validateBody =
  (validator: ValidateFunction): RequestHandler =>
  (req, res, next) =>
    validator(req.body) ? next() : res.status(400).json(validator.errors);

/**
 * Middleware that runs all validation functions against request body to ensure it passes all validation
 */
export const validateBody_all =
  (...validators: ValidateFunction[]): RequestHandler =>
  (req, res, next) => {
    for (const validator of validators)
      if (!validator(req.body)) return res.status(400).json(validator.errors);

    return next();
  };

/**
 * Middleware that runs given validation functions against request body until a single validator passes
 */
export const validateBody_some =
  (...validators: ValidateFunction[]): RequestHandler =>
  (req, res, next) => {
    // Array of errors
    const errors = [];

    for (const validator of validators)
      if (validator(req.body)) return next();
      else errors.push(validator.errors);

    // Flatten errors as each error element is an error of errors from the validator
    return res.status(400).json(errors.flat());
  };
