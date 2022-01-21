chrome.runtime.onInstalled.addListener((installationObject) => {
  if (installationObject.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("DNS-Notes installed");
  }
});

chrome.contextMenus.create({
  id: "context-menu-create",
  title: "Create new note",
});

chrome.contextMenus.create({
  id: "context-menu-view",
  title: "View notes",
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
  console.log("info", info);
  const { id, incognito } = tab;
});
