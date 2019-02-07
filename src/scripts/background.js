// Alec Shashaty & Arzang Kasiri, 2019

import Async from './asyncFunctions.js';
import Tree from './Tree.js';

const linksToProcess = []; // global array for queueing impending links for tracking in sequence



// on initial extension install, add this script
chrome.runtime.onInstalled.addListener(function () {


    // quick script for activating the popup button when the active tab is a
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



// on install or browser relaunch: initialize the descent button as untoggled, 
// the tree beginning toggler to true, and the current session to null
Async.storageSyncSet({descentToggled: false,
                      startTree: true,
                      currentSession: null
                     });


// on page load completion, if the url is a wikipedia link: 
//  grab the state of the descent button and use it to store pages as appropriate
chrome.webNavigation.onCompleted.addListener(pageDetails => {
    if(pageDetails.url.includes('.wikipedia.org')) {
        Async.storageSyncGet(['descentToggled', 'startTree', 'currentSession']).then(result => {
            let toggle = result.descentToggled,
                startTree = result.startTree,
                currentSession = result.currentSession;
            
            if(toggle && !startTree) {
                
                if(linksToProcess) {
                    let newLink = linksToProcess.shift();
                    
                    Async.urlTabQuery(newLink.url).then(tab => {
                        let currentId = Tree.genTreeId(tab.id,tab.url),
                            currentUrl = tab.url,
                            currentTitle = tab.title.replace(' - Wikipedia', '');
                        
                        let newTree = new Tree({id: currentId, title: currentTitle, url: currentUrl});
                        
                        newTree._sessionId = currentSession;
                        

                        
                        // get the current session tree
                        Async.storageSyncGet(currentSession).then(sessionTreeObj => {
                            let parentId = Tree.genTreeId(newLink.openerTabId, newLink.openerTabUrl);
                            console.log("parentId: " + parentId);
                            console.log("sessionId: " + newTree._sessionId);

                            console.log(sessionTreeObj[currentSession]);
                            let sessionTree = Tree.deserializeTree(sessionTreeObj[currentSession]);
                            
                            sessionTree = Tree.assignParentById({sessionTree: sessionTree,
                                                                 parentId: parentId,
                                                                 newChild: newTree});
                                
                            console.log(currentSession);
                            
                            // update the session tree in memory
                            Async.storageSyncSet({[currentSession]:sessionTree});
                        });
                        
                    });
                }
                
            };
        });
    }
});

// event handler for context menu 'open link in new tab'
const newTabLogger = tab => {    
        
    if(tab.url.includes('.wikipedia.org')) {
        console.log(tab.url);
        console.log(tab.openerTabId + " opened me!");
        
        
        Async.storageSyncGet('descentToggled').then(result => {
            if(result.descentToggled) {
                // tricky workaround to get the url of the tab
                // that opened this one
                chrome.tabs.get(tab.openerTabId, openerTab => {
                    linksToProcess.push({url: tab.url,
                                         tabId: tab.id,
                                         openerTabId: tab.openerTabId,
                                         openerTabUrl: openerTab.url
                                        });
                    console.log(linksToProcess); // TEST
                });
            }    
        });
    }
        
    // ensure the function runs only once
    chrome.tabs.onCreated.removeListener(newTabLogger);
};
    

// listener for taking messages during runtime from content scripts and other
// extension pages
chrome.runtime.onMessage.addListener((message,sender,sendResponse) => {
    console.log("message", message);  
    console.log("sender", sender);
      
    
    
    if(message.eventType === 'contextMenu' && message.linkUrl !== undefined) {
        // attach a listener to watch for a new wikipedia tab to open
        chrome.tabs.onCreated.removeListener(newTabLogger);
        chrome.tabs.onCreated.addListener(newTabLogger);
        
    } else if(message.eventType === 'click' && message.linkUrl !== undefined) {
        // just push the clicked link to the queue
        
        Async.storageSyncGet('descentToggled').then(result => {
            if(result.descentToggled) {
                linksToProcess.push({url: message.linkUrl,
                                     tabId: sender.tab.id,
                                     openerTabId: sender.tab.id,
                                     openerTabUrl: sender.tab.url
                                    });
                console.log(linksToProcess); // TEST
            } 
        });

        
    }
});
