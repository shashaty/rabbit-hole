// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';






// when the #savePage button is clicked,
// stores the current page by setting the key to the
// page title string (minus the " - Wikipedia" part),
// and the value to the url.
let savePage = document.getElementById('savePage'),
    pageDisplay = document.getElementById('pageDisplay'),
    timerToggle = document.getElementById('timerToggle'),
    timerReset = document.getElementById('timerReset'),
    timerDisplay = document.getElementById('timerDisplay'),
    descentButton = document.getElementById('descentButton'),
    descentContainer = document.getElementById("descentContainer");

descentButton.addEventListener("mouseover", function () {
    descentContainer.classList.add("descentContainerOnHover");

});

descentButton.addEventListener("mouseout", function () {
    descentContainer.classList.remove("descentContainerOnHover");
});

// temporarily repurposed the descend button for opening the display tree page
descentButton.addEventListener("click", function () {
    var tabby;

    chrome.tabs.create(
        {
            'active': true,
            'url':"../src/showtree.html?tree=test_text"
        },
        function(tab) {}
    );
});

savePage.addEventListener("click", function () {

    chrome.tabs.query({
        // checking the active tab:
        'active': true,
        'currentWindow': true
    }, function (tabs) {
        // save the page url and title
        var url = tabs[0].url,
            title = tabs[0].title.replace(' - Wikipedia', '');
        chrome.storage.sync.set({
            // key: value
            title: url
        }, function () {
            // Prints out the saved url to the console of the popup window
            // (/not/ to the console of the active tab!)
            console.log('Value is set to ' + url);
        });
        pageDisplay.innerHTML = "Saved! " + title;

    });
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
