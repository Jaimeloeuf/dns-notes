/**
 * API for error reporting
 * Mounted on /error
 * @author JJ
 * @module Error APIs
 */

import express from "express";
import unixseconds from "unixseconds";
import { asyncWrap } from "express-error-middlewares";

const router = express.Router();

/**
 * API to receive error messages
 * @name POST /error
 */
router.post(
  "/",

  // @todo Rate limit this API with a middleware
  // (req, res, next) => {
  //   res.status(429).json({});
  // },

  express.json(),

  asyncWrap(async (req, res) => {
    // Save error and get back doc ID
    const { id } = await require("@enkeldigital/firebase-admin")
      .fs.collection("errors")
      .add({ ...req.body, time: unixseconds() });

    // @todo Notify admin using telegram

    return res.status(200).json({ id });
  })
);

module.exports = router;
