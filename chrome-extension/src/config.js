export const getAppURL = (path = "/") =>
  new Promise((resolve) =>
    chrome.storage.sync.get("appURL", ({ appURL }) =>
      // Get the final Web app URL by concatenating the path to base URL
      resolve(appURL + path)
    )
  );
