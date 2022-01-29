/**
 * Authorization middleware
 * Using "Firebase Auth" for authentication
 */

const firebaseAdmin = require("@enkeldigital/firebase-admin");

// Admin only middleware is the combination of authentication middleware plus authorization middleware
module.exports = [
  require("firebase-auth-express-middleware")(firebaseAdmin),

  /**
   * Only allow admins with the admin claim on their JWT to pass
   * HTTP 403 means identity known but denied / failed authentication
   */
  async (req, res, next) =>
    firebaseAdmin
      .auth()
      .getUser(req.authenticatedUser.uid)
      .then((user) =>
        user.customClaims?.admin === true
          ? next()
          : res.status(403).json({ error: "UNAUTHORIZED" })
      )
      .catch((e) => res.status(403).json({ error: e.message })),
];
