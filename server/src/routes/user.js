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
  "/user/invite/:orgID",

  // Ensure same org
  authzMW((token, req) => req.params.orgID === token.org),

  // Ensure user who is requesting for the invite is an admin
  authzMW((token) => token.admin),

  // Only parse request body if user authorized to access API
  express.json(),

  // Since user account is not created yet, store the properties in FS first
  // Then on first login, call API to set claims
  asyncWrap(async (req, res) =>
    fs
      .collection("user-invitations")
      .add({
        ...req.body.user,

        // The org is automatically set to be the same as the admin's organization
        org: req.authenticatedUser.org,

        // Auto generated server timestamp to check if invite expired later on
        time: unixseconds(),
      })
      .then(({ id }) => res.status(201).json({ id }))
  )
);

/**
 * API for new users to accept an invitation to join an org, to set claims on their accounts
 * @name POST /accept/invitation
 */
router.post(
  "/accept/invitation",

  asyncWrap(async (req, res) => {
    const snapshot = await fs
      .collection("user-invitations")
      .where("email", "==", req.authenticatedUser.email)
      // This will fail if the user requested to join more than one organization
      // .where("org", "==", req.params.org)
      .get();

    if (snapshot.empty)
      return res.status(400).json({ error: "No invitation found" });

    const claims = require("../utils/claims.js");
    const invitation = snapshot.docs[0].data();

    // Set claims for user account
    claims.setClaimsWithEmail({
      // Only set a admin claim on JWT if admin permission is granted
      // Else do not set admin: false so that the JWT is smaller in size
      ...(invitation.admin ? { admin: true } : {}),

      org: invitation.org,
    })(invitation.email);

    res.status(200).json({});
  })
);

module.exports = router;
