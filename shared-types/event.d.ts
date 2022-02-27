import { Note } from "./note";

export type AddEvent = {
  type: "add";
  note: Note;
};

export type DelEvent = {
  type: "del";
  noteID: string;
};

export type EditEvent = {
  type: "edit";
  note: Note;
};

/**
 * Sync event is either one of the 3 events with extra properties set by the API when saving to DB
 */
export type SyncEvent = (AddEvent | DelEvent | EditEvent) & {
  time: number;
  user: string;
  org: string;
};
