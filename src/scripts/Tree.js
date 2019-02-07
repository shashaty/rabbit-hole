// Alec Shashaty & Arzang Kasiri, 2019



// takes an object literal with three properties: id, title, & url


class Tree {
    
    constructor(treeObj) {
        this._id = treeObj.id;
        this._sessionId = null;
        this._root_node = {
            page: {
                title: treeObj.title,
                url: treeObj.url
            },
            parent: null,
            children: []   
        };
    }
    
    get id() {
        return this._id;
    }
    set id(newId) {
        this._id = newId;
    }
    
    get title() {
        return this._root_node.page.title;
    }
    set title(newTitle) {
        this._root_node.page.title = newTitle;
    }
    
    get url() {
        return this._root_node.page.url;
    }
    set url(newUrl) {
        this._root_node.page.url = newUrl;
    }
    
    get root_node() {
        return this._root_node;
    }
    
    get parent() {
        // can return null if no parent!
        return this._root_node.parent; 
    }
    
    get children() {
        // can return empty array if no children!
        return this._root_node.children;
    }
    
    get sessionId() {
        return this._sessionId;
    }
    
    set sessionId(ID) {
        this._sessionId = ID;
    }
    
    // takes a Tree object
    setParent(parent) {
        if(parent instanceof Tree) {
            this._root_node.parent = parent;
            this._sessionId = parent._sessionId; // automatically sets the sessionId
                                                // equal to parent
        } else {
            throw new TypeError("Tree.setParent takes a Tree instance as a parameter!");
        }
        
    }
    
    // takes a Tree object
    addChild(child) {
        if(child instanceof Tree) {
            this._root_node.children.push(child);
        } else {
            throw new TypeError("Tree.addChild takes a Tree instance as a parameter!");
        }
        
    }
    
    // basic logging function for testing
    printTree() {
        console.log("hi I am a tree with ID " + this._id + ", title " + this._root_node.page.title + ", and url " + this._root_node.page.url);
    }
    
    
    // -------------------- STATIC METHODS -------------------------
    
    // for making unique IDs for every page (might need some TLC :/)
    static genTreeId(tabID,url) {
        return String(tabID) + '__&__' + url;
    }
    
    
     /**
      * basic depth first search to find the proper parent for a child,
      * then add that child to the parent 
      * @param {Object} idObj
      * @param {Tree} idObj.sessionTree                    
      * @param {string} idObj.parentId
      * @param {Tree} idObj.newChild
      * @returns {Tree} the modified sessionTree
      *  

      */
    static assignParentById(idObj) {
        let sessionTree = idObj.sessionTree,
            parentId = idObj.parentId,
            newChild = idObj.newChild;
        
        let childQueue = [sessionTree];
        
        while(childQueue) {
            let curr = childQueue.shift();
            try {
                if(curr._id === parentId) {
                    curr.addChild(newChild);
                    return sessionTree;
                }
            } catch(error) {
                console.log(error);
                console.log(curr);
                break;
            }
                
            
            for(let i = 0; i<curr._root_node.children.length; i++) {
                childQueue.push(curr._root_node.children[i]);
            }
            
        }
        
        
        throw new ReferenceError('parent not found!');
    }
    
    
    // recursive factory method to be used when retrieving a tree from chrome.storage
    // TODO: figure out how to recursively add parent data as well (maybe not necessary just for 
    // visual representation though)
    static deserializeTree(treeObj) {
        if(treeObj) {
            let resultTree = new Tree({id: treeObj._id,
                                       title: treeObj._root_node.page.title,
                                       url: treeObj._root_node.page.url});
        
            resultTree._sessionId = treeObj._sessionId;
            
//        this parent code causes an infinite loop
//
//            if(treeObj._root_node.parent) {
//                resultTree.setParent(Tree.deserializeTree(treeObj._root_node.parent));
//            }
            
            for(let i=0; i < treeObj._root_node.children.length; i++) {
                resultTree.addChild(Tree.deserializeTree(treeObj._root_node.children[i]));
            }
        
            return resultTree;
            
        } else {
            
            return null;
        }
    }
}


export default Tree;