/* 
NOTES:
contentscript.js reads from and writes to the DOM of the currently active tab.

Chrome uses an "isolated worlds" paradigm that allows extension scripts to
run in parallel with existing page scripts without conflicting.
*/


/* 
Preliminary ideas:
- If a Wikipedia page is about a place, it typically, if not always, includes 
  that place's latitude and longitude. The script could store coordinates if they exist,
  and plot visited places on a map accessible through the pop-up menu.
  
- Add a zoom on hover feature to images (rather than only being able to click through to 
    a new link). 
    
- Have ways of customizing wiki page styles in the options page, write the settings to the
  active tab.
*/
