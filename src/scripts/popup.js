// Alec Shashaty & Arzang Kasiri, 2019

import('/../../node_modules/chrome-extension-async/chrome-extension-async.js');
import Tree from "./Tree.js";
import Async from "./asyncFunctions.js";



let showTrees = document.getElementById('showTrees'),
    pageDisplay = document.getElementById('pageDisplay'),
    timerToggle = document.getElementById('timerToggle'),
    timerReset = document.getElementById('timerReset'),
    timerDisplay = document.getElementById('timerDisplay'),
    descentButton = document.getElementById('descentButton'),
    descentContainer = document.getElementById("descentContainer");


    
/* -------------  DESCENT BUTTON ------------------  */

// basic hover listeners for descent button
descentButton.addEventListener("mouseover", function () {
    descentContainer.classList.add("descentContainerOnHover");

});

descentButton.addEventListener("mouseout", function () {
    descentContainer.classList.remove("descentContainerOnHover");
});


// descent button toggles page saving on click
descentButton.addEventListener("click", async function () {
    
    // on descent button click, grab the current state of descentToggled,
    // flip it, then reset it to the new value
    Async.storageSyncGet('descentToggled').then(result => {
        let descentToggled = result.descentToggled;
        descentToggled = !descentToggled;
        if(!descentToggled) {
            // reinitialize the start of the tree if session is over
            Async.storageSyncSet({descentToggled: descentToggled,
                                  startTree: true,
                                  currentSession: null
                                 }); 
        } else {
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


// preliminary timer code, to be optimized further:
// end goal is a visual stopwatch, with a start/stop and reset button.
var timerToggled = false;
var startTime = 0;
var finishTime = 0;
timerToggle.addEventListener("click", function () {
    var timerDifference = 0;
    timerToggled = !timerToggled;

    if (timerToggled) {
        timerToggle.getElementsByTagName('p')[0].innerHTML = "Stop timer";
        startTime = Date.now();
    } else {
        timerToggle.getElementsByTagName('p')[0].innerHTML = "Start timer";
        finishTime = Date.now();
        timerDifference = (finishTime - startTime) / 1000.00;
        timerDisplay.innerHTML = timerDifference.toString() + " seconds!";
        startTime = 0;
        finishTime = 0;
    }




});
