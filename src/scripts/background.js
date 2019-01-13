// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function () {


    // quick script for activating the popup button when the active tab is a
    // wikipedia link.
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        hostContains: '.wikipedia.org'
                    },
                })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
});
