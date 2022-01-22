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

function createNote() {}
function viewNote() {}
function viewAllNotes() {}

const registerOnclickHandler = () =>
  chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    // Destructure out values from info object that will actually be passed to the individual handlers
    const { pageUrl, menuItemId, selectionText } = info;

    // Create the context object for the individual callback functions from info values and tab
    const context = { pageUrl, menuItemId, selectionText, tab };

    switch (info.menuItemId) {
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
