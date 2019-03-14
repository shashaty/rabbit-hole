// backgroundPage.js
// Alec Shashaty & Arzang Kasiri, 2019

import Async from './classes/Async.js';
import Tree from './classes/Tree.js';
import Stopwatch from './classes/Stopwatch.js';
import OpenTab from './classes/OpenTab.js';
import Background from './classes/Background.js';

const bg = new Background();
let stopwatch = new Stopwatch();

window.backgroundGlobal = {};
window.backgroundGlobal.bg = bg;
window.backgroundGlobal.stopwatch = stopwatch;

// on initial extension install, add this script
chrome.runtime.onInstalled.addListener(function () {
    // activates the popup button when the active tab is a
    // wikipedia link.
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        hostContains: '.wikipedia.org'
                    },
                })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
});

// on page load completion, if the url is a wikipedia link: 
//  grab the state of the descent button and use it to store pages as appropriate
chrome.webNavigation.onCompleted.addListener(pageDetails => {
    if(bg.trackingActive) {
        if(pageDetails.url.includes('.wikipedia.org') &&
           !pageDetails.url.includes('/File:') &&
           bg.openTabs[pageDetails.tabId].navType === 'navigate') {
            console.log('web nav complete!', pageDetails.url);
            bg.processNewLink(pageDetails);
            
        } else if(pageDetails.url.includes('.wikipedia.org') &&
                  !pageDetails.url.includes('/File:') &&
                  bg.openTabs[pageDetails.tabId].navType === 'back_forward') {
            bg.openTabs[pageDetails.tabId].getHistoryByUrl(pageDetails.url);
        }
    }
    
});

// listener for taking messages during runtime from content scripts and other
// extension pages
chrome.runtime.onMessage.addListener((message,sender,sendResponse) => {
    console.log("message", message);  
    console.log("sender", sender);
      
    if(message.source === 'linkListener.js') {
        bg.linkListenerHandler(message,sender,sendResponse);
    } else if(message.source === 'popup.js') {
        if(message.descent) {
            bg.parentIdInit = message.parentId;
            bg.trackingActive = true;
        } else {
            bg.openTabs = {}; // end of session: reset the tab tracker
            bg.parentIdInit = null;
            bg.trackingActive = false;
        }  
    } else if(message.source === 'historyListener.js' && bg.trackingActive) {
        bg.openTabs[sender.tab.id].navType = message.currentNavType;
    }
});
