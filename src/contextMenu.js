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

export default {
  createContextMenus,
};
