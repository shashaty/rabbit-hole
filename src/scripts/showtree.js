// Alec Shashaty & Arzang Kasiri, 2019
// tree structure in this file gratefully adapted from https://codepen.io/philippkuehn/pen/QbrOaN

import Tree from "./Tree.js";
import Async from './asyncFunctions.js';

const urlParams = new URLSearchParams(window.location.search);
const queryString = urlParams.get('tree');


const deleteButton = document.getElementById('deleteButton'),
      clearOverlay = document.getElementById('clearOverlay'),
      yesClear = document.getElementById('yesClear'),
      noClear = document.getElementById('noClear');


deleteButton.addEventListener('click', () => {
    clearOverlay.classList.add('makeVisible');
});


yesClear.addEventListener('click', () => {
    // clear all storage history
    Async.storageSyncRemove(queryString).then(result => {
        clearOverlay.classList.remove('makeVisible'); 
    });
    
    
});

noClear.addEventListener('click', () => {
   clearOverlay.classList.remove('makeVisible'); 
});
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
    nodeInfo.addEventListener('click', () => {
       chrome.tabs.create({active: false, url: node.page.url}, function(tab) {});
    });
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
        treeDiv.innerHTML += '<p style="text-align:center;">whoops! looks like we lost that tree :/</p>';
        throw new ReferenceError('need a tree saved to chrome.storage.sync with key ' + testUrlString + " - just reset testUrlString in showtree.js");
    }

    tree = Tree.deserializeTree(tree[testUrlString]);

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
            document.getElementById('durationDisplay').innerHTML = formatDuration(treeToDraw.duration);
            
        } else { console.log(treeToDraw);}
        
    }
    else {
        treeDiv.innerHTML += "Doesn't look like you visited any pages on this binge.";
    }
});


const formatDuration = duration => {
    let result = '';
    if(duration[0] > 0) {
        result += `${duration[0]} hours, `;
    } else if(duration[0] === 1) {
        result += `${duration[0]} hour, `;
    }
    if(duration[1] > 1) {
        result += `${duration[1]} minutes, `;
    } else if(duration[1] === 1) {
        result += `${duration[1]} minute, `;
    }
    if(duration[2] === 1) {
        result += `${duration[2]} second, ${Math.round(duration[3])} ms`;
    } else {
        result += `${duration[2]} seconds, ${Math.round(duration[3])} ms`;
    }
    return result;
};