// historyListener.js
// Alec Shashaty & Arzang Kasiri, 2019
// content script for listening to back & forward button events

let currentNav = window.performance.getEntriesByType('navigation')[0];

chrome.runtime.sendMessage({source: 'historyListener.js',
                            currentNavType: currentNav.type});