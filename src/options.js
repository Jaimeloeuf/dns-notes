import { h, text, app } from "https://unpkg.com/hyperapp";

const AddNewNote = (state) => ({
  ...state,
  notes: state.notes.concat(state.newNote),
  newNote: {
    provider: "",
    domain: "",
    type: "",
    name: "",
    value: "",
    note: "",
  },
});

const NewValue = (detailPropertyString) => (state, event) => ({
  ...state,

  newNote: {
    ...state.newNote,
    [detailPropertyString]: event.target.value,
  },
});

app({
  init: {
    notes: [
      {
        provider: "cloudflare",
        domain: "covid",
        type: "CNAME",
        name: "_lnslgknlsfIOH_lsndlgdsl",
        value: "",
        note: "Domain verification for Emails",
      },
      {
        provider: "cloudflare",
        domain: "covid",
        type: "CNAME",
        name: "_lnslgknlsfIOH_lsndlgdsl",
        value: "",
        note: "Domain verification for Emails",
      },
    ],

    newNote: {
      provider: "",
      domain: "",
      type: "",
      name: "",
      value: "",
      note: "",
    },
  },

  view: ({ notes, newNote }) =>
    h("main", {}, [
      h("h1", {}, text("DNS Notes")),

      h("table", {}, [
        h("tr", {}, [
          // Which DNS provider is this record stored in
          h("th", {}, text("DNS provider")),

          // Which domain is this record for
          h("th", {}, text("Domain")),

          // Type of DNS record, can be A/AAAA/CNAME/TXT
          h("th", {}, text("Record Type")),

          // The domain or subdomain you are pointing. Use '@' for your plain domain (e.g. coolexample.com). Don't input your domain name in this field (e.g. 'www', not 'www.coolexample.com').
          h("th", {}, text("Name")),

          // The destination of the record - the value varies based on the record type.
          // This is optional as sometimes the value is dynamic or always changing
          h("th", {}, text("Value")),

          // Note for this particular record
          h("th", {}, text("Note")),
        ]),

        ...notes.map((note) =>
          h("tr", {}, [
            h("td", {}, text(note.provider)),
            h("td", {}, text(note.domain)),
            h("td", {}, text(note.type)),
            h("td", {}, text(note.name)),
            h("td", {}, note.value ? text(note.value) : text("--NIL--")),
            h("td", {}, text(note.note)),
          ])
        ),
      ]),

      h("section", {}, [
        h("input", {
          type: "text",
          oninput: NewValue("provider"),
          value: newNote.provider,
        }),
        h("input", {
          type: "text",
          oninput: NewValue("domain"),
          value: newNote.domain,
        }),
        h("input", {
          type: "text",
          oninput: NewValue("type"),
          value: newNote.type,
        }),
        h("input", {
          type: "text",
          oninput: NewValue("name"),
          value: newNote.name,
        }),
        h("input", {
          type: "text",
          oninput: NewValue("value"),
          value: newNote.value,
        }),
        h("input", {
          type: "text",
          oninput: NewValue("note"),
          value: newNote.note,
        }),
        h("button", { onclick: AddNewNote }, text("Add new")),
      ]),
    ]),

  node: document.getElementById("app"),
});
