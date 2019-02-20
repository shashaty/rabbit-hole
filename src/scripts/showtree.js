// Alec Shashaty & Arzang Kasiri, 2019
// tree structure in this file gratefully adapted from https://codepen.io/philippkuehn/pen/QbrOaN

import Tree from "./Tree.js";


const urlParams = new URLSearchParams(window.location.search);
const queryString = urlParams.get('tree');
console.log(queryString);

/*
TREE object representation:
{String id, Object root_node}

NODE object representation:
{Object page, Array children}

PAGE object representation:
{String title, String url}
*/

const testTree = new Tree({id:'example tree', title: 'cat', url: 'wikipedia.org/cat'});

testTree.addChild(new Tree({id:'child 1',title:'child 1',url:''}));
testTree.addChild(new Tree({id:'child 2',title:'child 2',url:''}));


function addPageInfo(node, nodeInfo) {
    // simple now, can show more later such as:
    //  - image
    //  - hover over to display the wiki page
    nodeInfo.innerHTML = node.page.title;
}

// adding nodes
//////////////////////////

function addTreeNode(node, nodeContainer) {
    // TODO: titles with special characters might break the HTML
    nodeContainer.setAttribute('id', 'node_' + node.page.title);
    nodeContainer.classList.add('tree_node');
    
    var nodeInfo = document.createElement("div");
    

    // populate nodeInfo with the stored wiki page data
    addPageInfo(node, nodeInfo);
    nodeContainer.appendChild(nodeInfo);
    
    // if a node has children, recursively add them to the DOM
    if(node.children.length > 0) {
        
        var nodeChildren = document.createElement("ul");
        
        // populate nodeChildren with the next visited pages
        for (let i = 0; i < node.children.length; i++) {
            var childContainer = document.createElement("li");

            addTreeNode(node.children[i].root_node, childContainer);

            nodeChildren.appendChild(childContainer);
        }
        
        nodeContainer.appendChild(nodeChildren);
    }
    
    }



// this is the sessionID string that determines what to pull out of storage
const testUrlString = queryString;


// database retrieval
/////////////////////////////

chrome.storage.sync.get(testUrlString, function (result) {
    var treeDiv = document.getElementById("tree_div");
    
    var tree = Object.keys(result).length > 0 ? result : testTree;
    
    if(tree[testUrlString] === undefined) {
        treeDiv.innerHTML += '<p style="text-align:center;">no test tree has been saved yet!</p>';
        throw new ReferenceError('need a tree saved to chrome.storage.sync with key ' + testUrlString + " - just reset testUrlString in showtree.js");
    }

    tree = Tree.deserializeTree(tree[testUrlString]);
    

    // a very elaborate and space-wasting testing schema for Tree class methods
    // -------------------------------------------------------
    let dummyTree5 = { _id: 5,
                       _sessionId: 123,
                       _root_node: {
                            page: {
                                title: "five",
                                url: "four.com"
                            },
                            parent: null,
                            children: []
                       }
                     };
    
    dummyTree5 = Tree.deserializeTree(dummyTree5);
    
    let dummyTree4 = { _id: 4,
                       _sessionId: 123,
                       _root_node: {
                           page: {
                               title: "four",
                               url: "four.com"
                           },
                           parent: null,
                           children: []
                       }
                     };
    let dummyTree3 = { _id: 3,
                       _sessionId: 123,
                       _root_node: {
                           page: {
                               title: "three",
                               url: "three.com"
                           },
                           parent: null,
                           children: [dummyTree4]
                       }
                     };  
    let dummyTree2 = { _id: 2,
                       _sessionId: 123,
                       _root_node: {
                           page: {
                               title: "two",
                               url: "two.com"
                           },
                           parent: null,
                           children: []
                       }
                     };  
    let dummyTree1 = { _id: 1,
                       _sessionId: 123,
                       _root_node: {
                           page: {
                               title: "one",
                               url: "one.com"
                           },
                           parent: null,
                           children: [dummyTree2, dummyTree3]
                       }
                     };
    dummyTree4._root_node.parent = dummyTree3;
    dummyTree3._root_node.parent = dummyTree1;
    dummyTree2._root_node.parent = dummyTree1;
    
    // -----------------------------------------
    
    
    let deserializeTest = Tree.deserializeTree(dummyTree1);
    
    deserializeTest = Tree.assignParentById({sessionTree: deserializeTest, parentId: 3, newChild: dummyTree5});

      
    let treeToDraw = tree;
    let treeTitle = `${treeToDraw.timestamp} ${treeToDraw.title}`;
    
    document.title = treeTitle;
    document.getElementById('treeHeader').innerHTML = treeTitle;
    if (treeToDraw.root_node) { // if data exists
        let treeContainer = document.createElement('ul');
        let rootContainer = document.createElement('li');
        treeContainer.appendChild(rootContainer);
           
        
        addTreeNode(treeToDraw.root_node, rootContainer); // transferring data to html

        treeDiv.appendChild(treeContainer); // adding the tree to the page
        
        if(treeToDraw.duration !== undefined) {
            document.getElementById('durationDisplay').innerHTML = treeToDraw.duration;
            
        } else { console.log(treeToDraw);}
        
    }
    else {
        treeDiv.innerHTML += "Doesn't look like you visited any pages on this binge.";
    }
});
