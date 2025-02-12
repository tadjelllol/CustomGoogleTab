chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({ url: 'chrome-extension://' + chrome.runtime.id + '/newtab.html' });
});
