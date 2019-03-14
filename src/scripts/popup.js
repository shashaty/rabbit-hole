// popup.js
// Alec Shashaty & Arzang Kasiri, 2019

import('/../../node_modules/chrome-extension-async/chrome-extension-async.js');
import Tree from './Tree.js';
import Async from './Async.js';
import Stopwatch from './Stopwatch.js';
import OpenTab from './OpenTab.js';

let showTrees = document.getElementById('showTrees'),
    pageDisplay = document.getElementById('pageDisplay'),
    timerToggle = document.getElementById('timerToggle'),
    timerReset = document.getElementById('timerReset'),
    timerDisplay = document.getElementById('timerDisplay'),
    descentButton = document.getElementById('descentButton'),
    descentContainer = document.getElementById("descentContainer");

const background = chrome.extension.getBackgroundPage();
const bgRef = background.backgroundGlobal.bg;

console.log = toLog => {
  background.console.log('from popup.js:',toLog);  
};
console.error = toError => {
    background.console.error('from popup.js:',toError);
};


// easy fix for issues with navigation during loading:
// just prevent access to the popup if it's not ready!
Async.activeTabQuery().then(tab => {
   if(tab.status === 'loading') {
       alert('looks like the tab is still loading.. give it a sec!');
       window.close();
   } 
});


// stopwatch ---------------------------

let stopwatch;

// on load
window.addEventListener('load',function() {
    // set up stopwatch and attach to the window
    stopwatch = background.backgroundGlobal.stopwatch;
    stopwatch.window = window;
    stopwatch.setDisplay(document.querySelector('.timerContainer'));
    stopwatch.print(stopwatch.times);
    
    // if the stopwatch was running before window was reopened,
    // continue running it
    if(stopwatch.running) {
        stopwatch.calcBackgroundTime(); // calculates the time elapsed since last runtime
        stopwatch.step(stopwatch.time);
    }
});

// on unload, mark the timestamp on background.html and send the new reference
// back to the background page
window.addEventListener("unload", function (event) {
    stopwatch.lastTime = background.performance.now();
    background.backgroundGlobal.stopwatch = stopwatch;
}, true);

/* -------------  DESCENT BUTTON ------------------  */

// basic hover listeners for descent button
descentButton.addEventListener("mouseover", function () {
    descentContainer.classList.add("descentContainerOnHover");

});

descentButton.addEventListener("mouseout", function () {
    descentContainer.classList.remove("descentContainerOnHover");
});


const sendToggleMessage = (toggle, parentId) => {
    // grabs all wikipedia tabs and sends a runtime message with new toggle setting
    Async.allWikiTabQuery().then(tabs => {
       for(let i = 0; i<tabs.length; i++) {
           chrome.tabs.sendMessage(tabs[i].id, {source: 'popup.js', 
                                                descent: toggle});
       } 
    });
    
    chrome.runtime.sendMessage({source: 'popup.js',
                                descent: toggle,
                                parentId: parentId});
};

// descent button toggles page saving on click
descentButton.addEventListener("click", async function () {
    
    // on descent button click, grab the current state of descentToggled,
    // flip it, then reset it to the new value
    Async.storageSyncGet('descentToggled').then(result => {
        let descentToggled = result.descentToggled;
        descentToggled = !descentToggled;
        
        if(!descentToggled) {
            stopwatch.stop();
            Async.storageSyncGet('currentSession').then(result => {
                Async.storageSyncGet(result.currentSession).then(session => {
                    session[result.currentSession].duration = stopwatch.times;
                    let d = new Date();
                    session[result.currentSession].timestamp = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
                    console.log(session);
                    Async.storageSyncSet(session);
                });
               
            });
            // reinitialize the start of the tree if session is over
            Async.storageSyncSet({descentToggled: descentToggled,
                                  startTree: true,
                                  currentSession: null
                                 }); 
            sendToggleMessage(descentToggled, null);
            
        } else {
            stopwatch.reset();
            stopwatch.start();
            Async.activeTabQuery().then(tab => {
                // save the page url and title
                let currentId = Tree.genTreeId(),
                    currentUrl = tab.url,
                    currentTitle = tab.title.replace(' - Wikipedia', '');
                
                let newTree = new Tree({id: currentId, title: currentTitle, url: currentUrl});
                
                newTree._sessionId = currentId;
                
                Async.storageSyncSet({descentToggled: descentToggled,
                                      startTree: false,
                                      currentSession: newTree.sessionId,
                                      [newTree._sessionId]: newTree});
                
                bgRef.openTabs[tab.id] = new OpenTab({
                    url: currentUrl,
                    openerTabId: null,
                    parentId: null,
                    rhId: currentId,
                    isRedirect: false
                });
                    
                sendToggleMessage(descentToggled, currentId); 
            });
        }       
   }); 
});

