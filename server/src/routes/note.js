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

/**
 * API for client to send events to
 * @name POST /note/sync/:orgID
 */
router.post(
  "/sync/:orgID",

  authzMW((token, req) => req.params.orgID === token.org),

  // Only parse request body if user authorized to access API
  express.json(),

  // Middleware to ensure event object is available
  (req, res, next) => {
    if (!req.body.event)
      res.status(400).json({ error: "Missing event object" });
    else next();
  },

  asyncWrap(async (req, res) => {
    const { event } = req.body;

    // Set a time field on the event object directly based on server's current time to sort events by time
    // Although a note object already have a time field, it is time of note creation,
    // This time field is for time of sync, so if there are 2 conflicting events, they are ordered by time of sync
    /*
      @todo
      An alternative is to use firestore's time 'field value' instead of rolling with my own timestamp
      Which might be even easier for firestore to order by.
      However, it would be more platform dependent and be harder to experiment with.
    */
    event.time = unixseconds();

    // Record who created this sync event and what organization is it for
    event.user = req.authenticatedUser.email;
    event.org = req.authenticatedUser.org;

    switch (event.type) {
      case "add":
        const noteRef = fs.collection("notes").doc();
        const { id } = noteRef;
        event.note.id = id;
        await noteRef.set(event.note);

        // Add event into the event store
        await fs.collection("events").add(event);

        return res.status(201).json({ id });

      case "del":
        // Delete note from notes store
        await fs.collection("notes").doc(event.noteID).delete();

        // Add event into the event store
        await fs.collection("events").add(event);

        return res.status(200).json({});

      case "edit":
        // Update note in notes collection
        await fs
          .collection("notes")
          .doc(event.note.id)
          .update({ ...event.note });

        // Add event into the event store
        await fs.collection("events").add(event);

        return res.status(200).json({});

      default:
        return res.status(400).json({
          error: `Invalid event type '${event.type}' sent to sync API`,
        });
    }
  })
);

module.exports = router;
