export type UserInvite = { email: string; admin: boolean };
export type UserInviteDoc = UserInvite & {
  /* These properties are set by the API when saving a UserInvite object */
  org: string;
  invitedBy: string;
  time: number;
};
