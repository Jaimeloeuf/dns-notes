/**
 * CRUD API for users
 * Mounted on /user
 * @author JJ
 * @module User APIs
 */

import express from "express";
import unixseconds from "unixseconds";
import { asyncWrap } from "express-error-middlewares";
import { authz as authzMW } from "firebase-auth-express-middleware";
import { fs, auth } from "@enkeldigital/firebase-admin";
import type { UserInvite, UserInviteDoc } from "../../../shared-types/user";

const router = express.Router();

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

    // @todo Use auth API to check if user account already exists first

    // @todo Ensure users can only be invited to join 1 org at a time
    const inviteUser = (user: UserInvite) =>
      fs.collection("user-invites").add({ ...user, org, invitedBy, time });

    // @todo Send invitation email to the user asking them to login directly
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
          : res.status(200).json({
              invite: { id: snap.docs[0]?.id, ...snap.docs[0]?.data() },
            })
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
    const docRef = fs.collection("user-invites").doc(req.params.invitationID!);

    const docSnapshot = await docRef.get();
    if (!docSnapshot.exists)
      return res.status(400).json({ error: "Invalid invitation ID" });

    const invitation = docSnapshot.data() as UserInviteDoc;

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

    return res.status(200).json({});
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
    await fs.collection("user-invites").doc(req.params.invitationID!).delete();

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

    return res.status(201).json({ id });
  })
);

/**
 * API for users to leave an org
 * @name POST /user/leave/:orgID
 */
router.post(
  "/leave/:orgID",

  // Ensure user belongs to an organization
  authzMW((token) => token.org !== undefined),

  asyncWrap(async (req, res) => {
    // Clear the custom claims on the user's JWT first
    await require("../utils/claims.js").setClaimsWithEmail({
      // Set both to undefined to remove any values
      admin: undefined,
      org: undefined,
    })(req.authenticatedUser.email);

    // @todo Update DB as needed
    // req.authenticatedUser.org;

    res.status(200).json({});
  })
);

/**
 * API for users to delete their account
 * @name POST /user/account/delete
 */
router.post(
  "/account/delete",

  // Ensure user does not belong to any organization
  // Must leave org first before deleting account
  authzMW((token) => token.org === undefined),

  asyncWrap(async (req, res) => {
    // Delete user from firebase auth
    await auth
      .getUserByEmail(req.authenticatedUser.email)
      .then(({ uid }) => auth.deleteUser(uid));

    // @todo Update DB as needed
    // req.authenticatedUser.org;

    res.status(200).json({});
  })
);

module.exports = router;
