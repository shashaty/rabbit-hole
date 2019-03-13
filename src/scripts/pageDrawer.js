// pageDrawer.js
// Alec Shashaty & Arzang Kasiri, 2019
// content script for adding visuals to the wikipedia page itself



let content = document.getElementById('content');

let statusDiv = document.createElement('div');
statusDiv.style.position = 'fixed';
statusDiv.style.width = '20px';
statusDiv.style.height = '20px';
statusDiv.style.backgroundColor = 'green';
statusDiv.style.bottom = '20px';
statusDiv.style.right = '20px';
statusDiv.id = "rabbitHoleStatus";

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