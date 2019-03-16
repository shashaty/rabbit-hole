// pageDrawer.js
// Alec Shashaty & Arzang Kasiri, 2019
// content script for adding visuals to the wikipedia page itself

let content = document.getElementById('content'),
    statusDiv = document.createElement('div'),
    logo = document.createElement('img'),
    statusCSS = {
        'position': 'fixed',
        'width': '50px',
        'height': '50px',
        'border-radius': '100%',
        'background-color': 'green',
        'bottom': '20px',
        'right': '20px',
        'display': 'flex',
        'align-items': 'center'
    },
    logoCSS = {
        'width': '30px',
        'height': 'auto',
        'margin': 'auto'
    };

for(let i in statusCSS) { statusDiv.style[i] = statusCSS[i]; }
for(let i in logoCSS) { logo.style[i] = logoCSS[i]; }
 
statusDiv.id = "rabbitHoleStatus";
logo.src = chrome.extension.getURL('images/hole_icon128.png');

statusDiv.appendChild(logo);
content.appendChild(statusDiv);


chrome.runtime.onMessage.addListener((message,sender,sendResponse) => {
   if(message.source === 'popup.js') {
       if(message.descent) {
           statusDiv.classList.add('descentActive');
       } else {
           statusDiv.classList.remove('descentActive');
       }
    }
    // totally empty and pointless callback, but keeps the console happy :)
    sendResponse();    
});