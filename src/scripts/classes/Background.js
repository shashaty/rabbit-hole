// Background.js
// Alec Shashaty & Arzang Kasiri, 2019

import Async from './Async.js';
import Tree from './Tree.js';
import Stopwatch from './Stopwatch.js';
import OpenTab from './OpenTab.js';

class Background {
    constructor() {
        // global set for queueing impending links for tracking
        // tabs stored as key: value pairs in the form
        // [tabId]: OpenTab({ url, (the tab's url)
        //                    openerTabId, (the id of the tab that opened it)
        //                    parentId, (the rhId of the tab that opened it)
        //                    rhId, (a unique id for this page in the session)
        //                    isRedirect (a boolean to mark redirected pages)
        //                  })
        
        this.openTabs = {};
        this.trackingActive = false;
        // on install or browser relaunch: initialize the descent button as untoggled, 
        // the tree beginning toggler to true, and the current session to null
        Async.storageSyncSet({descentToggled: false,
                              startTree: true,
                              currentSession: null
                             });
        this.parentIdInit = null;
    }
    
    async newPageToTree(newLink, pageDetails, stored) {
        Async.urlTabQuery(newLink.url.replace(/#[\S]*/,'')).then(tab => {
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
            
            if(toggle && !startTree && Object.keys(this.openTabs).length > 0) {
                chrome.tabs.sendMessage(pageDetails.tabId, {source: 'popup.js', descent:true}); 
                let newId = this.openTabs[pageDetails.tabId].currId;
                let newLink = this.openTabs[pageDetails.tabId].getHistoryById(newId);
                newLink.url = pageDetails.url; // sometimes pageDetails.url has the properly redirected url
                this.openTabs[pageDetails.tabId].currUrl = newLink.url;
                
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
                                if(this.openTabs.hasOwnProperty(tab.openerTabId)) {
                                    parentId = this.openTabs[tab.openerTabId].currId;
                                } else {
                                    parentId = this.parentIdInit;
                                }

                                this.openTabs[tab.id] = new OpenTab({
                                    url: tab.url,
                                    openerTabId: tab.openerTabId,
                                    parentId: parentId,
                                    rhId: Tree.genTreeId(),
                                    isRedirect: message.isRedirect
                                });
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
                    let strippedUrl = message.linkUrl.replace(/#[\S]*/,''); 
                    let strippedCurrUrl = this.openTabs[sender.tab.id].currUrl.replace(/#[\S]*/,'');
                    if(strippedUrl !== strippedCurrUrl) {
                        let parentId = null;
                        if(this.openTabs.hasOwnProperty(sender.tab.id)) {
                            parentId = this.openTabs[sender.tab.id].currId;
                        } else {
                            parentId = this.parentIdInit;
                        }
                    
                        this.openTabs[sender.tab.id].pushHistory({
                            url: message.linkUrl,
                            openerTabId: sender.tab.id,
                            parentId: parentId,
                            rhId: Tree.genTreeId(),
                            isRedirect: message.isRedirect
                        });
                    }
                } 
            });
       
        } else {
            throw new ReferenceError("message.linkUrl is undefined!");
        }
        
        
    }   
}

export default Background;