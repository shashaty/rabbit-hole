// Alec Shashaty & Arzang Kasiri, 2019

import Async from './asyncFunctions.js';
import Tree from './Tree.js';

// testing out object vs array implementation
const linksToProcess = {}; // global set for queueing impending links for tracking
// impending links stored as key: value pairs in the form
// [tabId]: { url,
//            tabId,
//            openerTabId, 
//            openerTabUrl
//          }



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
        console.log('web nav complete!', pageDetails.url);
        
        Async.storageSyncGet(['descentToggled', 'startTree', 'currentSession']).then(result => {
            let toggle = result.descentToggled,
                startTree = result.startTree,
                currentSession = result.currentSession;

              
            
            if(toggle && !startTree && Object.keys(linksToProcess).length > 0) {
                
                 chrome.tabs.sendMessage(pageDetails.tabId, {source: 'popup.js', descent:true}); 
                
                let newLink = linksToProcess[pageDetails.tabId];
                
                newLink.url = pageDetails.url; // sometimes pageDetails.url has the properly redirected url
                
                // handle redirecting links here, swapping newLink.url for the new url if it does change
                if(newLink.isRedirect) {
                    console.log('redirect!');

                    let tabUpdated = false; // simple bool to keep track of whether the tab updates
                    
                    const tabUpdateHandler = (tabId,changeInfo,tab) => {
                        if(changeInfo.url !== undefined && changeInfo.url.includes('.wikipedia.org/')) {
                                console.log('updated url!',changeInfo.url, changeInfo.status); 
                
                                newLink.url = changeInfo.url;
                                tabUpdated = true;
                                newPageToTree();
                                
                            }
                            chrome.tabs.onUpdated.removeListener(tabUpdateHandler);
                    };
                    
                    chrome.tabs.onUpdated.addListener(tabUpdateHandler);
                    
                    // set timeout after 3 seconds as backup in the case that the tab
                    // actually does redirect prior to webNavigation.onCompleted firing
                    
                    setTimeout(() => {if(!tabUpdated) {
                                        // remove the listener, as it's no longer necessary
                                        chrome.tabs.onUpdated.removeListener(tabUpdateHandler);
                                        newPageToTree();
                                        }}, 3000);
                    
                    
                    
                } else {
                    // if not a redirected page, just go ahead
                    newPageToTree();
                }
        

        
            
                function newPageToTree() {
                    Async.urlTabQuery(newLink.url).then(tab => {
                        console.log('pageDetails', pageDetails);
                        console.log('newLink', newLink);
                        console.log('tab from newLink', tab);
                        let currentId = Tree.genTreeId(tab.id,newLink.url),
                            currentUrl = newLink.url,
                            currentTitle = tab.title.replace(' - Wikipedia', '');
                        
                        let newTree = new Tree({id: currentId, title: currentTitle, url: currentUrl});
                        
                        newTree._sessionId = currentSession;
                        

                        
                        // get the current session tree
                        Async.storageSyncGet(currentSession).then(sessionTreeObj => {
                            let parentId = Tree.genTreeId(newLink.openerTabId, newLink.openerTabUrl);
                            console.log("parentId: " + parentId);
                            console.log("sessionId: " + newTree._sessionId);

                            let sessionTree = Tree.deserializeTree(sessionTreeObj[currentSession]);
                            
                            sessionTree = Tree.assignParentById({sessionTree: sessionTree,
                                                                 parentId: parentId,
                                                                 newChild: newTree});
                                
                            console.log('---------------------');
                            
                            // update the session tree in memory
                            Async.storageSyncSet({[currentSession]:sessionTree});
                        
                        });
                        
                    });
                }
            }
        });
    }
});

    


// listener for taking messages during runtime from content scripts and other
// extension pages
chrome.runtime.onMessage.addListener((message,sender,sendResponse) => {
    console.log("message", message);  
    console.log("sender", sender);
      
 
    if(message.source === 'linkListener.js'){
        if(message.eventType === 'contextMenu' && 
           message.linkUrl !== undefined) {
        
            // attach a listener to listen for a new wikipedia tab to open
            chrome.tabs.onCreated.addListener(function newTabLogger(tab) {
                if(tab.url.includes('.wikipedia.org')) {
                    console.log(tab.url);
                    console.log(tab.openerTabId + " opened me!");
        
                    
        
                    Async.storageSyncGet('descentToggled').then(result => {
                        if(result.descentToggled) {
                            
                            // tricky workaround to get the url of the tab
                            // that opened this one
                            chrome.tabs.get(tab.openerTabId, openerTab => {
                                linksToProcess[tab.id] = {url: tab.url,
                                                          tabId: tab.id,
                                                          openerTabId: tab.openerTabId,
                                                          openerTabUrl: openerTab.url,
                                                          isRedirect: message.isRedirect
                                                         };
                                console.log(linksToProcess); // TEST
                            });
                        } 
                });
            }
                // ensure the function runs only once
           chrome.tabs.onCreated.removeListener(newTabLogger);
            
        });
        
        } else if(message.eventType === 'click' && 
            message.linkUrl !== undefined) {
            // just push the clicked link to the queue
            
            Async.storageSyncGet('descentToggled').then(result => {
                if(result.descentToggled) {
                    linksToProcess[sender.tab.id] = {url: message.linkUrl,
                                                     tabId: sender.tab.id,
                                                     openerTabId: sender.tab.id,
                                                     openerTabUrl: sender.tab.url,
                                                     isRedirect: message.isRedirect
                                                     };
                    console.log(linksToProcess); // TEST
                    
                   
                } 
            });

        
        }
    }
});
