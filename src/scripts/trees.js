// trees.js
// Alec Shashaty & Arzang Kasiri, 2019

import('/../../node_modules/chrome-extension-async/chrome-extension-async.js');
import Tree from './Tree.js';
import Async from './Async.js';

const wrapper = document.querySelector('.wrapper');

// grab all contents of storage
Async.storageSyncGet().then(storage => {
    // make a list of their keys
    let storageKeys = Object.keys(storage);
    // for all keys
    for(let i = 0; i<storageKeys.length; i++) {
        // if the stored element's id is a saved tree
        if(storageKeys[i].includes('__rh__')) {
            // deserialize it and make an html element to represent it
            let newTree = Tree.deserializeTree(storage[storageKeys[i]]); 
            let newElt = document.createElement('button');
            newElt.classList.add('genTreeButton');
            newElt.style.display = 'inline-block';
            newElt.innerHTML = `<p>${newTree.timestamp} ${newTree.title}</p>`;
            newElt.href = "#";
            // make an event listener that takes the user to showTree.html with a query string
            // representing the tree to display
            newElt.addEventListener('click', () => {
               chrome.tabs.create(
                    {
                        'active': true,
                        'url': "../src/showTree.html?tree=" + storage[storageKeys[i]]._sessionId
                    },
                        function(tab) {}
                ); 
            });
            wrapper.appendChild(newElt);
        }
    }
});