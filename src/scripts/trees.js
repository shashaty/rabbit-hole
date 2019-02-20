// Alec Shashaty & Arzang Kasiri, 2019

import('/../../node_modules/chrome-extension-async/chrome-extension-async.js');
import Tree from './Tree.js';
import Async from './asyncFunctions.js';

const wrapper = document.querySelector('.wrapper');


Async.storageSyncGet().then(storage => {
    
    let storageKeys = Object.keys(storage);
    
    for(let i = 0; i<storageKeys.length; i++) {
        if(storageKeys[i].includes('__rh__')) {
            let newTree = Tree.deserializeTree(storage[storageKeys[i]]); 
            let newElt = document.createElement('button');
            newElt.classList.add('genTreeButton');
            newElt.style.display = 'inline-block';
            newElt.innerHTML = `<p>${newTree.timestamp} ${newTree.title}</p>`;
            newElt.href = "#";
            newElt.addEventListener('click', () => {
               chrome.tabs.create(
                    {
                        'active': true,
                        'url': "../src/showtree.html?tree=" + storage[storageKeys[i]]._sessionId
                    },
                        function(tab) {}
                ); 
            });
            wrapper.appendChild(newElt);
            
        }
    }
});