const showtree = require('../src/scripts/showtree.js');

const assert = require('assert');

const afafwfw = new Tree('asdf','fwfwwf','asfwfgh');



describe('testing testing', () => {
    
   it('is this thing on?', () => {
       
       const expected = 'yup';
       
       const micCheck = () => {
         return 'yup';  
       };
       
      assert.equal(micCheck(), expected); 
   }); 
});