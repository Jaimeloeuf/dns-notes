import { baseURL } from "./config.js";

/**
 * Run function to create all the context menus
 */
function createContextMenus() {
  const { create } = chrome.contextMenus;

  create({
    id: "cm-create",
    title: "Create new note for '%s'",
    type: "normal",
    contexts: ["selection"],
  });

  create({
    id: "cm-view",
    title: "View notes for '%s'",
    type: "normal",
    contexts: ["selection"],
  });

  create({
    id: "cm-view-all",
    title: "View notes for current domain",
    type: "normal",
    contexts: ["page"],
  });
}

// Create tab manually instead of opening options page with the method to set a custom SPA path
// chrome.runtime.openOptionsPage();
// Right now the app is hosted as the options page, but it can be changed to a standalone app
const openApp = (path) => chrome.tabs.create({ url: baseURL + path });

function createNote({ hostname, selectionText, tab }) {
  openApp(`/create?hostname=${hostname}&name=${selectionText}`);
}

function viewNote({ hostname, selectionText, tab }) {
  // openApp(`/view?hostname=${hostname}&name=${selectionText}`);
  openApp(`/view?query=${selectionText}`);
}

function viewAllNotes({ hostname, tab }) {
  openApp(`/view?hostname=${hostname}`);
}

const registerOnclickHandler = () =>
  chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    // Destructure out values from info object that will actually be passed to the individual handlers
    const { pageUrl, menuItemId, selectionText } = info;

    // Create the context object for the individual callback functions from info values and tab
    const context = {
      // https://stackoverflow.com/questions/6725890/location-host-vs-location-hostname-and-cross-browser-compatibility
      hostname: new URL(pageUrl).hostname,

      selectionText,
      tab,
    };

    switch (menuItemId) {
      case "cm-create":
        return createNote(context);

      case "cm-view":
        return viewNote(context);

      case "cm-view-all":
        return viewAllNotes(context);

      default:
        throw new Error("Unknown context menu item ID: " + info.menuItemId);
    }
  });

export default {
  createContextMenus,
  registerOnclickHandler,
};
