import contextMenu from "./contextMenu.js";

chrome.runtime.onInstalled.addListener((installationObject) => {
  if (installationObject.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("DNS-Notes installed");
  }

  // Create context menus only on install so it only run once
  // https://developer.chrome.com/docs/extensions/mv3/service_workers/#initialization
  contextMenu.createContextMenus();
});

// @todo Should this be inside the on install thing also???
contextMenu.registerOnclickHandler();

chrome.omnibox.onInputEntered.addListener(function (text) {
  // Encode user input for special characters , / ? : @ & = + $ #
  const newURL =
    "https://dns-notes.enkeldigital.com/search?q=" + encodeURIComponent(text);
  chrome.tabs.create({ url: newURL });
});
