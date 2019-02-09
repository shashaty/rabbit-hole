// Alec Shashaty & Arzang Kasiri, 2019


// content script for listening for all link clicks on a wikipedia page
// as well as for context menu opening (for 'Open in new tab' clicks)---
// sends a global runtime message to communicate the link and the click type

let links = document.querySelectorAll('a');

for(let i = 0; i < links.length; i++) {
    
    
    // when the context menu is opened on a link
    links[i].oncontextmenu = function(e) {
        let redirectLink = e.target.classList.contains('mw-redirect');
        chrome.runtime.sendMessage({linkUrl: e.target.href, 
                                    eventType: "contextMenu",
                                    isRedirect: redirectLink
                                   });
    };
    
    // when a link is clicked directly
    links[i].onclick = function(e) {
        let redirectLink = e.target.classList.contains('mw-redirect');
        chrome.runtime.sendMessage({linkUrl: e.target.href, 
                                    eventType: "click",
                                    isRedirect: redirectLink
                                   });
    };
}


