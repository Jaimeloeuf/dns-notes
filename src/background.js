chrome.runtime.onInstalled.addListener((installationObject) => {
  if (installationObject.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("DNS-Notes installed");
  }

  chrome.contextMenus.create({
    id: "cm-create",
    title: "Create new note for '%s'",
    type: "normal",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "cm-view",
    title: "View notes for '%s'",
    type: "normal",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "cm-view-all",
    title: "View notes for current domain",
    type: "normal",
    contexts: ["page"],
  });
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
  console.log("info", info);
  const { id, incognito } = tab;
});
