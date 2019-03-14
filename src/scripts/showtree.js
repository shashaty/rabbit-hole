// showTree.js
// Alec Shashaty & Arzang Kasiri, 2019
// tree structure in this file gratefully adapted from https://codepen.io/philippkuehn/pen/QbrOaN

import Tree from './classes/Tree.js';
import Async from './classes/Async.js';

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
    // remove the tree from storage
    Async.storageSyncRemove(queryString).then(result => {
        clearOverlay.classList.remove('makeVisible'); 
        document.getElementById('treeHeader').innerHTML = 'deleted tree!';
        document.getElementById('tree_div').remove();
        document.getElementById('durationDiv').remove();
        
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


// database retrieval
/////////////////////////////

Async.storageSyncGet(queryString).then(tree => {
    var treeDiv = document.getElementById("tree_div");
    
    if(tree[queryString] === undefined) {
        treeDiv.innerHTML += '<p style="text-align:center;">whoops! looks like we lost that tree :/</p>';
        throw new ReferenceError('need a tree saved to chrome.storage.sync with key ' + queryString);
    }

    tree = Tree.deserializeTree(tree[queryString]);

    let treeTitle = `${tree.timestamp} ${tree.title}`;
    document.title = treeTitle;
    document.getElementById('treeHeader').innerHTML = treeTitle;
    
    if (tree.root_node) { // if data exists
        let treeContainer = document.createElement('ul');
        let rootContainer = document.createElement('li');
        treeContainer.appendChild(rootContainer); 
        
        addTreeNode(tree.root_node, rootContainer); // transferring data to html
        treeDiv.appendChild(treeContainer); // adding the tree to the page
        
        if(tree.duration !== undefined) {
            document.getElementById('durationDisplay').innerHTML = formatDuration(tree.duration);     
        } else {
            throw new ReferenceError('session duration undefined!');
        }
    } else {
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