// Alec Shashaty & Arzang Kasiri, 2019

const chrome = require('sinon-chrome');
import {assert} from 'chai';
import Async from '../src/scripts/classes/Async.js';

// pretty broken right now :/
describe('storage', () => {
    before(function () {
        global.chrome = chrome;
    });
    
    it('saves and retrieves a single item', () => {
        
        Async.storageSyncSet({foo:'bar'});
        
        Async.storageSyncGet('foo').then(result => {
            assert.equal(result.foo === 'bar');
        });
        
    });
    
    
    it('saves and retrieves multiple items from storage', () => {
        Async.storageSyncSet({one:'1',two:'2',three:'3'});
        
        Async.storageSyncGet(['one','two']).then(result => {
            assert.hasAllKeys(result, ['one','two']);
            assert.propertyVal(result,'one','1');
            assert.propertyVal(result,'two','2');
        });    
    });
    
    it('retrieves all items from storage', () => {
        Async.storageSyncSet({one:'1',two:'2',three:'3'});
        
        Async.storageSyncGet().then(result => {
            assert.hasAllKeys(result, ['one','two','three']);
            assert.propertyVal(result,'one','1');
            assert.propertyVal(result,'two','2');
            assert.propertyVal(result,'three','3');
        });  
    });
    
    it('clears storage', () => {
        Async.storageSyncSet({one:'1',two:'2',three:'3'});
        
        Async.storageSyncClear().then(x => {
            Async.storageSyncGet().then(result => {
               assert.isEmpty(result); 
            });
        });
        
    });
    
    afterEach(() => {
       chrome.storage.sync.clear(); 
    });
    
});