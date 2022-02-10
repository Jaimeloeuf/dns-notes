import { h, text, app } from "./hyperapp.js";

// No hyperapp state change, only saving entire state object into chrome storage
const saveOptions = (state) => {
  chrome.storage.sync.set(state);
  alert("Options saved!");
  return state;
};

const NewValue = (detailPropertyString) => (state, event) => ({
  ...state,
  [detailPropertyString]: event.target.value,
});

const getAppURL = () =>
  new Promise((resolve, reject) =>
    chrome.storage.sync.get("appURL", ({ appURL }) => resolve(appURL))
  );

app({
  init: {
    appURL: await getAppURL(),
  },

  view: ({ appURL }) =>
    h("main", {}, [
      h("h1", {}, text("DNS Notes extension options")),

      h("section", {}, [
        h("label", {}, [
          text("Web App's base URL"),
          h("input", {
            type: "text",
            placeholder: "https://app.dns-notes.enkeldigital.com/#",
            oninput: NewValue("appURL"),
            value: appURL,
            style: { width: "40em" },
          }),
        ]),

        h("br", {}),
      ]),

      h(
        "button",
        { style: { display: "block" }, onclick: saveOptions },
        text("Save")
      ),
      // @todo Add a reset button
    ]),

  node: document.getElementById("app"),
});
