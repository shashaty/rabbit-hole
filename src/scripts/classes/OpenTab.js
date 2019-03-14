// OpenTab.js
// Alec Shashaty & Arzang Kasiri, 2019
// a class for storing information about an open tab and its history

class OpenTab {
    // takes an object 'link' with the properties
    // url, openerTabId, parentId, rhId, isRedirect
    constructor(link) {
        this.currUrl = link.url;
        this.currId = link.rhId;
        
        this.navType = null;
        this.history = [];
        this.pushHistory(link);
    }
    
    pushHistory(link) {
        this.currUrl = link.url;
        this.currId = link.rhId;
        
        this.history.push({
            url: link.url,
            openerTabId: link.openerTabId,
            parentId: link.parentId,
            rhId: link.rhId,
            isRedirect: link.isRedirect
        });
    }
    
    getHistoryByUrl(url) {
        let result = this.history.find(elt => {
           return elt.url === url;
        });
        
        if(result === undefined) {
            throw ReferenceError(url + ' not found in tab history!');
            return undefined;
        } else {
            this.currUrl = result.url;
            this.currId = result.rhId;
            return result;
        } 
    }
    
    getHistoryById(id) {
        let result = this.history.find(elt => {
           return elt.rhId === id;
        });
        
        if(result === undefined) {
            throw ReferenceError(url + ' not found in tab history!');
            return undefined;
        } else {
            this.currUrl = result.url;
            this.currId = result.rhId;
            return result;
        } 
    }
    
    getRecent() {
        return this.history.slice(-1)[0];
    }
}

export default OpenTab;