// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';


// when the #savePage button is clicked,
// stores the current page by setting the key to the
// page title string (minus the " - Wikipedia" part),
// and the value to the url.
let savePage = document.getElementById('savePage');
let pageDisplay = document.getElementById('pageDisplay');

savePage.addEventListener("click", function () {

    chrome.tabs.query({
        // checking the active tab:
        'active': true,
        'currentWindow': true
    }, function (tabs) {
        // save the page url and title
        var url = tabs[0].url;
        var title = tabs[0].title.replace(' - Wikipedia', '')
        chrome.storage.sync.set({
            // key: value
            title: url
        }, function () {
            // Prints out the saved url to the console of the popup window
            // (/not/ to the console of the active tab!)
            console.log('Value is set to ' + url);
        })
        pageDisplay.innerHTML = "Saved! " + title

    });
});

// Sample color changing code from Chrome API tutorial
// ----------------------------------------------------

//let changeColor = document.getElementById('changeColor');
//chrome.storage.sync.get('color', function (data) {
//    changeColor.style.backgroundColor = data.color;
//    changeColor.setAttribute('value', data.color);
//});


//changeColor.onclick = function (element) {
//    let color = element.target.value;
//    chrome.tabs.query({
//        active: true,
//        currentWindow: true
//    }, function (tabs) {
//        chrome.tabs.executeScript(
//            tabs[0].id, {
//                code: 'document.body.style.backgroundColor = "' + color + '";'
//            });
//    });
//};