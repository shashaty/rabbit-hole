// Alec Shashaty & Arzang Kasiri, 2019


const assert = require('assert');
const chrome = require('sinon-chrome');


// new & improved! now with chrome api!
describe('testing testing', () => {
    
   it('is this thing on?', () => {
       chrome.storage.sync.set({testing:'123'});
       const expected = '123';
       
       chrome.storage.sync.get('testing',result => {
            assert.equal(result, expected); 
        });
      
   }); 
    
    after(() => {
       chrome.storage.sync.clear(); 
    });
});