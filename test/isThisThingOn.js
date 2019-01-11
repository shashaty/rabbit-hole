const assert = require('assert');

describe('testing testing', () => {
    
   it('is this thing on?', () => {
       
       const expected = 'yup';
       
       const micCheck = () => {
         return 'yup';  
       };
       
      assert.equal(micCheck(), expected); 
   }); 
});