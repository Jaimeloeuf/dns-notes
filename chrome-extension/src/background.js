import contextMenu from "./contextMenu.js";
import { baseURL } from "./config.js";

chrome.runtime.onInstalled.addListener((installationObject) => {
  if (installationObject.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("DNS-Notes installed");

    // Set default extension settings
    chrome.storage.sync.set({
      webAppURL: "https://app.dns-notes.enkeldigital.com/#",
    });
  }

  // Create context menus only on install so it only run once
  // https://developer.chrome.com/docs/extensions/mv3/service_workers/#initialization
  contextMenu.createContextMenus();
});

// @todo Should this be inside the on install thing also???
contextMenu.registerOnclickHandler();

// Encode user input for special characters , / ? : @ & = + $ #
chrome.omnibox.onInputEntered.addListener((text) =>
  // @todo Open link in current new tab instead of another tab
  chrome.tabs.create({
    url: `${baseURL}/view?query=${encodeURIComponent(text)}`,
  })
);
