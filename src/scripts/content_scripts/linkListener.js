// linkListener.js
// Alec Shashaty & Arzang Kasiri, 2019
// content script for listening for all link clicks on a wikipedia page
// as well as for context menu opening (for 'Open in new tab' clicks)---
// sends a global runtime message to communicate the link and the click type

let links = document.querySelectorAll('a');

const linkTracker = (e, eventType) => {
    let target = e.target;
    if(!target.matches('a')) {
        // if the link has an nested <em> or <i> tag: grab the parent <a> tag
        target = target.parentElement;
    }
    let isRedirect = target.classList.contains('mw-redirect');
    chrome.runtime.sendMessage({
        source: 'linkListener.js',
        linkUrl: target.href,
        eventType: eventType,
        isRedirect: isRedirect
    });    
}

for(let i = 0; i < links.length; i++) {
    // when the context menu is opened on a link
    links[i].oncontextmenu = e => {linkTracker(e,"contextMenu")};
    
    // when a link is clicked directly
    links[i].onclick = e => {linkTracker(e,"click")};
}