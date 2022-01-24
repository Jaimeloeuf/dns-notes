export default function () {
  chrome.tabs.create({
    // Create tab and focus on it
    active: true,

    // From chrome extension root URL to chrome extension settings page
    // chrome-extension://aeghlmlmidbengggkhfocdkdhejpmfjh/
    // chrome://extensions/?id=aeghlmlmidbengggkhfocdkdhejpmfjh
    url:
      "chrome://extensions/?id=" +
      chrome.runtime
        .getURL("")
        .replace("chrome-extension://", "")
        .replace("/", ""),
  });
}
