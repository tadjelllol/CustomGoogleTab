chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.onCreated.addListener(tab => {
        chrome.tabs.update(tab.id, { url: 'chrome://newtab/' });
    });
});
