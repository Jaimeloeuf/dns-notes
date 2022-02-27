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
const { fs } = require("@enkeldigital/firebase-admin");

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
 * Function to get events from firestore
 * @param {String} orgID orgID of the user found on their JWT
 * @param {String} lastSync unix seconds in string to be parsed into a Int
 */
const getEvents = async (orgID, lastSync) =>
  fs
    .collection("events")
    .where("org", "==", orgID)
    .where("time", ">=", parseInt(lastSync))
    .orderBy("time", "asc")
    .get()
    .then((snap) => snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    .then((events) => ({ events, time: unixseconds() }));

/**
 * API for clients to get events for syncing and to get a new last sync time
 * @name GET /note/sync/:orgID/:lastSync
 */
router.get(
  "/sync/:orgID/:lastSync",

  authzMW((token, req) => req.params.orgID === token.org),

  asyncWrap(async (req, res) =>
    res.status(200).json(await getEvents(req.params.orgID, req.params.lastSync))
  )
);

/**
 * API for client to send events to
 * @name POST /note/sync/:orgID/:lastSync
 */
router.post(
  "/sync/:orgID/:lastSync",

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

    // @todo Verify shape of event objects for each and every event type

    switch (event.type) {
      case "add":
        // Ensure note object exists on event object
        if (!event.note)
          return res
            .status(400)
            .json({ error: "Missing note object in event object" });

        // Prevent users from setting other user's email as note creator
        if (event.note.user !== req.authenticatedUser.email)
          return res
            .status(400)
            .json({ error: "Notes must be created with your own email" });

        // Prevent users from creating note under other organizations
        if (event.note.org !== req.authenticatedUser.org)
          return res
            .status(400)
            .json({ error: "Notes must belong to your own organization" });

        // Setting this in the API so clients dont have to set it, and they cant change this field maliciously
        event.note.user = req.authenticatedUser.email;
        event.note.org = req.authenticatedUser.org;

        // Add note into the notes store with the firestore doc ID as the id field on the note object
        // Then get back the updated note object with ID to set on the event object,
        // So that the note object on the event object is the same as the note object stored in firestore.
        //
        // Alternative:
        // const noteRef = fs.collection("notes").doc();
        // const { id } = noteRef;
        // event.note.id = id;
        // await noteRef.set(event.note);
        event.note = await require("../utils/saveWithID.js")(
          fs,
          "notes",
          event.note
        );

        // Add event into the event store
        await fs.collection("events").add(event);

        return res
          .status(201)
          .json(await getEvents(req.params.orgID, req.params.lastSync));

      case "del":
        // Delete note from notes store
        await fs.collection("notes").doc(event.noteID).delete();

        // Add event into the event store
        await fs.collection("events").add(event);

        return res
          .status(200)
          .json(await getEvents(req.params.orgID, req.params.lastSync));

      case "edit":
        // @todo Check to ensure that user did not change the id of the note??? maybe should have a seperate noteID field?
        // Update note in notes collection by overwriting the original note
        // Semantically similar to deleting and creating new one with the same note ID
        await fs.collection("notes").doc(event.note.id).set(event.note);

        // Add event into the event store
        await fs.collection("events").add(event);

        return res
          .status(200)
          .json(await getEvents(req.params.orgID, req.params.lastSync));

      default:
        return res.status(400).json({
          error: `Invalid event type '${event.type}' sent to sync API`,
        });
    }
  })
);

module.exports = router;
