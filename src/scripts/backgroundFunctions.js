// backgroundFunctions.js
// Alec Shashaty & Arzang Kasiri, 2019

import Async from './Async.js';
import Tree from './Tree.js';
import Stopwatch from './Stopwatch.js';

class Background {
    constructor() {
        // global set for queueing impending links for tracking
        // impending links stored as key: value pairs in the form
        // [tabId]: { url, (the tab's url)
        //            openerTabId, (the id of the tab that opened it)
        //            parentId, (the rhId of the tab that opened it)
        //            rhId, (a unique id for this page in the session)
        //            isRedirect (a boolean to mark redirected pages)
        //          }
        this.linksToProcess = {};
        
        // on install or browser relaunch: initialize the descent button as untoggled, 
        // the tree beginning toggler to true, and the current session to null
        Async.storageSyncSet({descentToggled: false,
                              startTree: true,
                              currentSession: null
                             });
        this.parentIdInit = null;
    }
    
    async newPageToTree(newLink, pageDetails, stored) {
        Async.urlTabQuery(newLink.url).then(tab => {
            let currentSession = stored.currentSession;
            console.log('newLink', newLink);
            
            let currentId = newLink.rhId,
                currentUrl = newLink.url,
                currentTitle = tab.title.replace(' - Wikipedia', '');
            
            let newTree = new Tree({id: currentId, title: currentTitle, url: currentUrl});         
            newTree._sessionId = currentSession;
            
            // get the current session tree
            Async.storageSyncGet(currentSession).then(sessionTreeObj => {
                let parentId = newLink.parentId;
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
    
    async processNewLink(pageDetails) {
        Async.storageSyncGet(['descentToggled', 'startTree', 'currentSession']).then(stored => {
            let toggle = stored.descentToggled,
                startTree = stored.startTree,
                currentSession = stored.currentSession;
            
            if(toggle && !startTree && Object.keys(this.linksToProcess).length > 0) {
                chrome.tabs.sendMessage(pageDetails.tabId, {source: 'popup.js', descent:true}); 
                
                let newLink = this.linksToProcess[pageDetails.tabId];
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
                            this.newPageToTree(newLink, pageDetails, stored);
                        }
                        chrome.tabs.onUpdated.removeListener(tabUpdateHandler);
                    };
                    
                    chrome.tabs.onUpdated.addListener(tabUpdateHandler);
                    
                    // set timeout after 3 seconds as backup in the case that the tab
                    // actually does redirect prior to webNavigation.onCompleted firing
                    setTimeout(() => {if(!tabUpdated) {
                                        // remove the listener, as it's no longer necessary
                                        chrome.tabs.onUpdated.removeListener(tabUpdateHandler);
                                        this.newPageToTree(newLink, pageDetails, stored);
                                        }}, 3000);
                } else {
                    // if not a redirected page, just go ahead
                    this.newPageToTree(newLink, pageDetails, stored);
                }
            }
        });
    }
    
    async linkListenerHandler(message,sender,sendResponse) {
        if(message.eventType === 'contextMenu' && 
           message.linkUrl !== undefined) {
            
            const newTabLogger = tab => {
                if(tab.url.includes('.wikipedia.org') && !tab.url.includes('/File:')) {
                    console.log(tab.url);
                    console.log(tab.openerTabId + " opened me!");
        
                    Async.storageSyncGet('descentToggled').then(result => {
                        if(result.descentToggled) {
                            
                            // tricky workaround to get the url of the tab
                            // that opened this one
                            chrome.tabs.get(tab.openerTabId, openerTab => {
                                let parentId = null;
                                if(this.linksToProcess.hasOwnProperty(tab.openerTabId)) {
                                    parentId = this.linksToProcess[tab.openerTabId].rhId;
                                } else {
                                    parentId = this.parentIdInit;
                                }
                                this.linksToProcess[tab.id] = {
                                    url: tab.url,
                                    openerTabId: tab.openerTabId,
                                    parentId: parentId,
                                    rhId: Tree.genTreeId(),
                                    isRedirect: message.isRedirect
                                };
                            });
                        } 
                    });
                }
                // ensure the function runs only once
                chrome.tabs.onCreated.removeListener(newTabLogger);
            };
        
            // attach a listener to listen for a new wikipedia tab to open
            chrome.tabs.onCreated.addListener(newTabLogger);
        
        } else if(message.eventType === 'click' && 
                  message.linkUrl !== undefined) {
            // just push the clicked link to the queue
            
            Async.storageSyncGet('descentToggled').then(result => {
                if(result.descentToggled) {
                    let parentId = null;
                    if(this.linksToProcess.hasOwnProperty(sender.tab.id)) {
                        parentId = this.linksToProcess[sender.tab.id].rhId;
                    } else {
                        parentId = this.parentIdInit;
                    }
                    this.linksToProcess[sender.tab.id] = {
                        url: message.linkUrl,
                        openerTabId: sender.tab.id,
                        parentId: parentId,
                        rhId: Tree.genTreeId(),
                        isRedirect: message.isRedirect
                    };
                } 
            });
        }
    }   
}

export default Background;