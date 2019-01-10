'use strict';

var urlString = window.location.href;
var url = new URL(urlString);
var treeName = url.searchParams.get('tree');

/*
tree json representation:

tree wrapper: {name, root_node}
tree made up of nodes: {page, children}
*/
var testTree = {
    'tree_name': "Example Tree",
    'root_node':
    {
        'page': {
            'title': "Cat",
            'url': "wikipedia.org/cat"
        },
        'children': [
            {
                'page': {'title': "child 1"},
                'children': []
            },
            {
                'page': {'title': "child 2"},
                'children': []
            },
        ]
    }
}

function addPageInfo(node, nodeInfo) {
    // simple now, can show more later such as:
    //  - image
    //  - hover over to display the wiki page
    nodeInfo.innerHTML = node.page.title;
};

function addTreeNode(node, nodeContainer) {
    // TODO: titles with special characters might break the HTML
    nodeContainer.setAttribute('id', 'node_' + node.page.title);
    nodeContainer.classList.add('tree_node');

    var nodeInfo = document.createElement("div");
    var nodeChildren = document.createElement("ul");

    // populate nodeInfo with the stored wiki page data
    addPageInfo(node, nodeInfo);

    // populate nodeChildren with the next visited pages
    for (var i = 0; i < node.children.length; i++) {
        var childContainer = document.createElement("li");

        addTreeNode(node.children[i], childContainer);

        nodeChildren.appendChild(childContainer);
    }

    nodeContainer.appendChild(nodeInfo);
    nodeContainer.appendChild(nodeChildren);
};

chrome.storage.local.get([treeName], function (result) {
    var tree = Object.keys(result).length > 0 ? result : testTree;
    var treeDiv = document.getElementById("tree_div");

    if (tree.root_node) {
        var rootContainer = document.createElement("ul");

        addTreeNode(tree.root_node, rootContainer);

        treeDiv.appendChild(rootContainer);
    }
    else {
        treeDiv.innerHTML += "Doesn't look like you visited any pages on this binge.";
    }
});
