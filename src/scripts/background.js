// background.js
// Alec Shashaty & Arzang Kasiri, 2019

import Async from './Async.js';
import Tree from './Tree.js';
import Stopwatch from './Stopwatch.js';
import Background from './backgroundFunctions.js';

const bg = new Background();

window.backgroundGlobal = {};

let stopwatch = new Stopwatch();
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
    if(pageDetails.url.includes('.wikipedia.org') && !pageDetails.url.includes('/File:')) {
        console.log('web nav complete!', pageDetails.url);       
        bg.processNewLink(pageDetails);
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
        } else {
            bg.linksToProcess = {}; // end of session: reset the link tracker
            bg.parentIdInit = null;
        }  
    }
});
