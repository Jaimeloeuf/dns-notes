import contextMenu from "./contextMenu.js";

chrome.runtime.onInstalled.addListener((installationObject) => {
  if (installationObject.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("DNS-Notes installed");
  }

  contextMenu.createContextMenus();
});

chrome.contextMenus.onClicked.addListener(
  contextMenu.contextMenuOnclickHandler
);
