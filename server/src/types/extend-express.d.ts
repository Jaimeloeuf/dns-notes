import type express from "express";

declare global {
  namespace Express {
    // Extending the Request type to add `authenticatedUser` property set by the firebase auth middleware library
    interface Request {
      // Possibly undefined if request is typed before using the `authn` middleware
      // However almost all API routes are mounted after the authn middleware,
      // So can safely assume that Request objects have the `authenticatedUser` property
      // authenticatedUser?: Record<string, any>;

      // Could be a generic Record type but since the set of properties and custom claims expected,
      // is more or less fixed, they are manually typed out instead
      authenticatedUser: {
        uid: string;
        email: string;
        org: string;

        // Admin Boolean is only set when true, else not set to reduce JWT size
        admin: true | undefined;
      };
    }
  }
}
