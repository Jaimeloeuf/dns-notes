import { getAppURL } from "./config.js";

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

const openApp = async (path) =>
  chrome.tabs.create({ url: await getAppURL(path) });

const registerOnclickHandler = () =>
  chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    // Destructure out values from info object that will actually be passed to the individual handlers
    const { pageUrl, menuItemId, selectionText } = info;

    // https://stackoverflow.com/questions/6725890/location-host-vs-location-hostname-and-cross-browser-compatibility
    const hostname = new URL(pageUrl).hostname;

    switch (menuItemId) {
      case "cm-create":
        return openApp(`/create?hostname=${hostname}&name=${selectionText}`);

      case "cm-view":
        // return openApp(`/view?hostname=${hostname}&name=${selectionText}`);
        return openApp(`/view?query=${selectionText}`);

      case "cm-view-all":
        return openApp(`/view?hostname=${hostname}`);

      default:
        throw new Error("Unknown context menu item ID: " + info.menuItemId);
    }
  });

export default {
  createContextMenus,
  registerOnclickHandler,
};
