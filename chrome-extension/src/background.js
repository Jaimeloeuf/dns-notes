import contextMenu from "./contextMenu.js";
import { getAppURL } from "./config.js";

chrome.runtime.onInstalled.addListener((installationObject) => {
  if (installationObject.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("DNS-Notes installed");

    // Set default extension settings
    chrome.storage.sync.set({
      // DO NOT change these names in future versions, as these default values are only set once on install
      // Which means that if the code changes to get from another key, the value will not exist and cause bugs.
      appURL: "https://app.dns-notes.enkeldigital.com/#",
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
  // Open link in current tab
  chrome.tabs.query(
    { active: true, currentWindow: true },
    async ([currentTab]) =>
      chrome.tabs.update(currentTab.id, {
        url: await getAppURL(`/view?query=${encodeURIComponent(text)}`),
      })
  )
);
