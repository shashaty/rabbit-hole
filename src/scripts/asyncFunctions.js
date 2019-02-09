// Alec Shashaty & Arzang Kasiri, 2019


import('/../../node_modules/chrome-extension-async/chrome-extension-async.js');


// class with static methods to organize & wrap all asynchronous chrome api function calls
// 
// feel free to add more! :^) 
class Async {
    
    // grabs the currently active tab
    static async activeTabQuery() {   
        // Query the tabs and continue once we have the result
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        return activeTab;
    }
    
    // takes a string representing a url pattern to match tabs to
    static async urlTabQuery(urlParam) {
        
        // remove the section markers in urls that break chrome.tabs.query
        let strippedUrl = urlParam.replace(/#[\S]*/,''); 
        // get active tabs from url input
        const tabs = await chrome.tabs.query({url: strippedUrl});

        if(tabs.length === 0) {
            throw new ReferenceError('Async.urlTabQuery came up with no results for search param ' 
                                     + strippedUrl);
        }
        
        const tab = tabs[0]; // just pick whichever identical tab comes first
        return tab;    
        
    }
    
    static async storageSyncSet(obj) {
        await chrome.storage.sync.set(obj);
        
    }
    
    /**
    * @param {string | string[]} [keys] - a string representing one key, an array representing
    * multiple keys, or not entered, returning all key/value pairs in storage
    */
    static async storageSyncGet(keys) {
        if(keys) {
            const result = await chrome.storage.sync.get(keys);
            return result;
        } else {
            // fix for returning all items when no key(s) are specified
            return new Promise((resolve, reject) => {
               chrome.storage.sync.get(resolve); 
            });
            
            
        }
        
    }
    
    // clears all storage
    static async storageSyncClear() {
        await chrome.storage.sync.clear();
    }
}




export default Async;