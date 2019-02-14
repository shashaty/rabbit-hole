// Alec Shashaty & Arzang Kasiri, 2019

import('/../../node_modules/chrome-extension-async/chrome-extension-async.js');
import Tree from './Tree.js';
import Async from './asyncFunctions.js';
import Stopwatch from './descentTimer.js';

let showTrees = document.getElementById('showTrees'),
    pageDisplay = document.getElementById('pageDisplay'),
    timerToggle = document.getElementById('timerToggle'),
    timerReset = document.getElementById('timerReset'),
    timerDisplay = document.getElementById('timerDisplay'),
    descentButton = document.getElementById('descentButton'),
    descentContainer = document.getElementById("descentContainer");

const background = chrome.extension.getBackgroundPage();


// stopwatch ---------------------------

let stopwatch;

// on load
window.addEventListener('load',function() {
    // set up stopwatch and attach to the window
    stopwatch = background.backgroundGlobal.stopwatch;
    stopwatch.window = window;
    stopwatch.setDisplay(document.querySelector('.timerContainer'));
    stopwatch.setResults(document.querySelector('.timerDisplay'));
    stopwatch.print(stopwatch.times);
    
    // if the stopwatch was running before window was reopened,
    // continue running it
    if(stopwatch.running) {
        stopwatch.calcBackgroundTime(); // calculates the time elapsed since last runtime
        stopwatch.step(stopwatch.time);
    }
    
    // attach listeners to debug buttons
    document.getElementById('stopwatchStart').onclick = () => {stopwatch.start()};
    document.getElementById('stopwatchStop').onclick = () => {stopwatch.stop()};
    document.getElementById('stopwatchRestart').onclick = () => {stopwatch.reset();
                                                             stopwatch.print();};
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


const sendToggleMessage = toggle => {
    // grabs all wikipedia tabs and sends a runtime message with new toggle setting
    Async.allWikiTabQuery().then(tabs => {
       for(let i = 0; i<tabs.length; i++) {
           chrome.tabs.sendMessage(tabs[i].id, {source: 'popup.js', descent: toggle});
       } 
    });
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
                    background.console.log(session);
                    session[result.currentSession].duration = stopwatch.times;
                    background.console.log(session);
                    Async.storageSyncSet(session);
                });
               
            });
            // reinitialize the start of the tree if session is over
            Async.storageSyncSet({descentToggled: descentToggled,
                                  startTree: true,
                                  currentSession: null
                                 }); 
            sendToggleMessage(descentToggled);
            
        } else {
            stopwatch.reset();
            stopwatch.start();
            Async.activeTabQuery().then(tab => {
                // save the page url and title
                let currentId = Tree.genTreeId(tab.id,tab.url),
                    currentUrl = tab.url,
                    currentTitle = tab.title.replace(' - Wikipedia', '');
                
                let newTree = new Tree({id: currentId, title: currentTitle, url: currentUrl});
                
                newTree._sessionId = currentId;
                
                Async.storageSyncSet({descentToggled: descentToggled,
                                      startTree: false,
                                      currentSession: newTree.sessionId,
                                      [newTree._sessionId]: newTree});
            });
            
            sendToggleMessage(descentToggled);
           
        }
                
   }); 
});

/* ------------------------------------------------  */



// temporary button for opening a page for displaying trees
showTrees.addEventListener("click", function () {
    chrome.tabs.create(
        {
            'active': true,
            'url':"../src/showtree.html?tree=test_text"
        },
        function(tab) {}
    );
});

