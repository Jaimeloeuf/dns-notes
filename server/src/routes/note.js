/**
 * CRUD API for notes
 * Mounted on /note
 * @author JJ
 * @module Note APIs
 */

const express = require("express");
const router = express.Router();
const unixseconds = require("unixseconds");
const { asyncWrap } = require("express-error-middlewares");
const authzMW = require("firebase-auth-express-middleware").authz;
const fs = require("@enkeldigital/firebase-admin").fs;

/**
 * API to get all notes of an org as an object
 * @todo Rate limit this API
 * @name GET /note/all/:orgID
 */
router.get(
  "/all/:orgID",

  authzMW((token, req) => req.params.orgID === token.org),

  asyncWrap(async (req, res) =>
    fs
      .collection("notes")
      .where("org", "==", req.params.orgID)
      .get()
      .then((snap) => snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      .then((data) => data.reduce((obj, cur) => ((obj[cur.id] = cur), obj), {}))
      .then((notes) => res.status(200).json({ notes, time: unixseconds() }))
  )
);

/**
 * API for clients to get events for syncing and to get a new last sync time
 * @name GET /note/sync/:orgID/:lastSync
 */
router.get(
  "/sync/:orgID/:lastSync",

  authzMW((token, req) => req.params.orgID === token.org),

  asyncWrap(async (req, res) =>
    fs
      .collection("events")
      .where("org", "==", req.params.orgID)
      .where("time", ">=", parseInt(req.params.lastSync))
      .orderBy("time", "asc")
      .get()
      .then((snap) => snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      .then((events) => res.status(200).json({ events, time: unixseconds() }))
  )
);

module.exports = router;
