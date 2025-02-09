chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({ url: 'chrome://newtab/' });
});

chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [{
        id: 1,
        priority: 1,
        action: { type: 'redirect', redirect: { extensionPath: '/newtab.html' } },
        condition: { urlFilter: 'chrome://newtab/' }
    }]
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.onCreated.addListener(tab => {
        chrome.tabs.update(tab.id, { url: 'chrome://newtab/' });
    });
});
