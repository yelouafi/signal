
var assert = require("assert"),
    jsdom = require('mocha-jsdom'),
    _ =  require("../src/static.js"),
    ss = require("../src/reactive.js"),
    ee = require("../src/browser/dom.js")
    

describe('dom', function() {
    
    jsdom();
    describe('basic tests', function() {
        
        it('should increment the span on each button click', function() {
           
            var btnUp = document.createElement('button'),
                out = document.createElement('span');
           
            btnUp.id = 'up';
            out.id = 'out';
            
            ee.$('#out', {
               text: ee.$('up').map(1).fold(0, _.inc)
            });
           
           assert.equal(out.textContent, '0'); 
           
           btnUp.click();
           assert.equal(out.textContent, '1'); 
        });
        
    })
    
})
    
    