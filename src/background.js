import contextMenu from "./contextMenu.js";

chrome.runtime.onInstalled.addListener((installationObject) => {
  if (installationObject.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("DNS-Notes installed");
  }

  // Create context menus only on install so it only run once
  // https://developer.chrome.com/docs/extensions/mv3/service_workers/#initialization
  contextMenu.createContextMenus();
});

contextMenu.registerOnclickHandler();
