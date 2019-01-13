'use strict';

var urlString = window.location.href;
var url = new URL(urlString);
var treeName = url.searchParams.get('tree');


class Tree {
    
    constructor(name,title,url) {
        this.name = name;
        this.root_node = {
            page: {
                title: title,
                url: url
            },      
            children: []   
        };
    }
    
    addChild(child) {
        this.root_node.children.push(child);
    }
}




const thing = new Tree('asdlf','wfff','asdfdsaf');


/*
tree json representation:

tree wrapper: {name, root_node}
tree made up of nodes: {page, children}
*/

const testTree = new Tree('example tree','cat','wikipedia.org/cat');

testTree.addChild(new Tree('child 1','child 1',''));
testTree.addChild(new Tree('child 2','child 2',''));


function addPageInfo(node, nodeInfo) {
    // simple now, can show more later such as:
    //  - image
    //  - hover over to display the wiki page
    nodeInfo.innerHTML = node.page.title;
}

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

chrome.storage.local.get([treeName], function (result) {
    var tree = Object.keys(result).length > 0 ? result : testTree;
    var treeDiv = document.getElementById("tree_div");

    if (tree.root_node) {
        var treeContainer = document.createElement('ul');
        var rootContainer = document.createElement('li');
        treeContainer.appendChild(rootContainer);
           
        addTreeNode(tree.root_node, rootContainer);

        treeDiv.appendChild(treeContainer);
    }
    else {
        treeDiv.innerHTML += "Doesn't look like you visited any pages on this binge.";
    }
});
