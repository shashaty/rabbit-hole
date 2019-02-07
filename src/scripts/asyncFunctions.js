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
        // get active tabs from url input
        const tabs = await chrome.tabs.query({url: urlParam, currentWindow: true});
        const tab = tabs[0]; // just pick whichever identical tab comes first
        return tab;     
    }
    
    static async storageSyncSet(obj) {
        await chrome.storage.sync.set(obj);
        
    }
    
    static async storageSyncGet(keys) {
        const result = await chrome.storage.sync.get(keys);
        return result;
    }
}




export default Async;