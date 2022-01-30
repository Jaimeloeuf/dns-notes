/**
 * CRUD API for notes
 * Mounted on /note
 * @author JJ
 * @module Note APIs
 */

const express = require("express");
const router = express.Router();
const { asyncWrap } = require("express-error-middlewares");

/**
 * API to get all notes of an org as an object
 * @todo Rate limit this API
 * @name GET /note/all
 */
router.get(
  "/all",
  asyncWrap(async (req, res) =>
    require("@enkeldigital/firebase-admin")
      .firestore()
      .collection("notes")
      .where("org", "==", req.authenticatedUser.claims.org)
      .get()
      .then((snap) => snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      .then((data) => data.reduce((obj, cur) => ((obj[cur.id] = cur), obj), {}))
      .then((notes) => res.status(200).json({ notes }))
  )
);

module.exports = router;
