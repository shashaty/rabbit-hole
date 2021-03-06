// settings.js
// Alec Shashaty & Arzang Kasiri, 2019

import('/../../../node_modules/chrome-extension-async/chrome-extension-async.js');
import Tree from '../classes/Tree.js';
import Async from '../classes/Async.js';

const clearButton = document.getElementById('clearButton'),
      clearOverlay = document.getElementById('clearOverlay'),
      yesClear = document.getElementById('yesClear'),
      noClear = document.getElementById('noClear');

clearButton.addEventListener('click', () => {
    clearOverlay.classList.add('makeVisible');
});

yesClear.addEventListener('click', () => {
    // clear all storage history
    Async.storageSyncClear().then(result => {
        // then reinitialize storage with default settings
        Async.storageSyncSet({descentToggled: false,
                              startTree: true,
                              currentSession: null
                             });
        clearOverlay.classList.remove('makeVisible'); 
    }); 
});

noClear.addEventListener('click', () => {
   clearOverlay.classList.remove('makeVisible'); 
});