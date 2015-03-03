var assert = require("assert"),
    su = require("../src/reactiveUtils.js");
   
describe('reactiveUtils', function() {
   
   describe('#timeout()', function() {
        it('shoudl wait 100 ms before emitting', function(done) {
           var to = su.timeout(100);
        
            var start = Date.now();    
            to.on(function(v) {
                var stop = Date.now();
                assert(stop-start >= 100, 'stop - start < 50');
                done();
            }); 
        })
   });
   
   describe('#timer()', function() {
        it('shoudl fire 5 times every 50 ms', function(done) {
           var  count = 0, 
                prec = 100,
                ticks = 5,
                delay = 0,
                to = su.timer(prec, delay, ticks);
        
            var start = Date.now();    
            to.on(function(v) {
                var stop = Date.now();
                count++;
                assert( stop-start >= (prec*count), stop-start + '>=' + (prec*count) );
                assert(count <= ticks, count + '<=' + ticks);
            });
            
            setTimeout(function() {
                assert.equal(count, ticks);
                done();
            }, 700);
        });
        
        it('shoudl fire 5 times every 100ms after 50ms', function(done) {
           var  count = 0, 
                prec = 100,
                ticks = 5,
                delay = 50,
                to = su.timer(prec, delay, ticks);
        
            var start = Date.now();    
            to.on(function(v) {
                var stop = Date.now();
                count++;
                assert( stop-start >= delay+(prec*count), stop-start + '>=' + (delay+prec*count) );
                assert(count <= ticks, count + '<=' + ticks);
            });
            
            setTimeout(function() {
                assert.equal(count, ticks);
                done();
            }, 800);
        });
   });
    
});