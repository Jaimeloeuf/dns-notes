/**
 * CRUD API for users
 * Mounted on /user
 * @author JJ
 * @module User APIs
 */

const express = require("express");
const router = express.Router();
const unixseconds = require("unixseconds");
const { asyncWrap } = require("express-error-middlewares");
const authzMW = require("firebase-auth-express-middleware").authz;
const fs = require("@enkeldigital/firebase-admin").fs;

/**
 * API for admins to invite new users
 * @name POST /user/invite/:orgID
 */
router.post(
  "/invite/:orgID",

  // Ensure same org
  authzMW((token, req) => req.params.orgID === token.org),

  // Ensure user who is requesting for the invite is an admin
  authzMW((token) => token.admin),

  // Only parse request body if user authorized to access API
  express.json(),

  // Since user account is not created yet, store the properties in FS first
  // Then on first login, call API to set claims
  asyncWrap(async (req, res) => {
    // The org is automatically set to be the same as the admin's organization
    const org = req.authenticatedUser.org;
    // Store the admin's email too to know who created the invite
    const invitedBy = req.authenticatedUser.email;
    // Auto generated server timestamp to check if invite expired later on
    const time = unixseconds();

    const inviteUser = (user) =>
      fs.collection("user-invites").add({ ...user, org, invitedBy, time });

    // API handler supports both getting an array of users and a single user
    if (
      req.body.users &&
      Array.isArray(req.body.users) &&
      req.body.users.length > 0
    )
      await Promise.all(req.body.users.map(inviteUser));
    else if (req.body.user) await inviteUser(req.body.user);

    res.status(201).json({});
  })
);

/**
 * API for users to check if they have a pending invitation
 * @name GET /user/invite/check/pending
 */
router.get(
  "/invite/check/pending",

  asyncWrap(async (req, res) =>
    fs
      .collection("user-invites")
      .where("email", "==", req.authenticatedUser.email)
      .get()
      .then((snap) =>
        snap.empty
          ? res.status(404).json({})
          : res
              .status(200)
              .json({ invite: { id: snap.docs[0].id, ...snap.docs[0].data() } })
      )
  )
);

/**
 * API for new users to accept an invitation to join an org, to set claims on their accounts
 * @name POST /user/invite/accept/:invitationID
 */
router.post(
  "/invite/accept/:invitationID",

  asyncWrap(async (req, res) => {
    const docRef = fs.collection("user-invites").doc(req.params.invitationID);

    const invitation = await docRef.get().then((doc) => doc.data());

    // Set claims for user account
    const claims = require("../utils/claims.js");
    await claims.setClaimsWithEmail({
      // Only set a admin claim on JWT if admin permission is granted
      // Else do not set admin: false so that the JWT is smaller in size
      ...(invitation.admin ? { admin: true } : {}),

      org: invitation.org,
    })(invitation.email);

    // Delete the invite after user setup is complete
    await docRef.delete();

    res.status(200).json({});
  })
);

/**
 * API for new users to reject an invitation to join an org
 * @name POST /user/invite/reject/:invitationID
 */
router.post(
  "/invite/reject/:invitationID",

  asyncWrap(async (req, res) => {
    // @todo Notify admin that invited this user

    // Delete invite from firestore to "reject"
    await fs.collection("user-invites").doc(req.params.invitationID).delete();

    res.status(200).json({});
  })
);

/**
 * API for users to request to join an org
 * @name POST /user/request/:orgID
 */
router.post(
  "/request/:orgID",

  // @todo Middleware to reject all requests for now as this feature might not be used
  (_, res) => res.status(400).json({ error: "Feature not allowed" }),

  // Ensure user does not already have an organization
  authzMW((token) => token.org === undefined),

  // Only parse request body if user authorized to access API
  express.json(),

  asyncWrap(async (req, res) => {
    const { org, admin } = req.body;

    // @todo Check that org is a valid one
    // return res.status(400).json({ error:"Invalid org ID" });

    // Check if admin is a valid Boolean value
    if (typeof admin !== "boolean")
      return res.status(400).json({ error: "Admin value must be boolean" });

    const { id } = await fs.collection("user-requests").add({
      org,
      admin,

      // Use the email attached to the user's token instead of accepting it as input
      email: req.authenticatedUser.email,

      // Auto generated server timestamp to check if request expired later on
      time: unixseconds(),
    });

    // @todo Email all admins of selected org to ask for their permissions

    res.status(201).json({ id });
  })
);

module.exports = router;
