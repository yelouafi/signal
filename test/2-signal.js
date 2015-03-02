var assert = require("assert"),
    Signal = require("../src/signal.js");

describe('Signal.prototype', function() {
    
    describe('#$$emit()', function(){
        
        it('should call registred listeners', function(){
            var res;
            function listener(v) {
                res = v;
            }
            var s = new Signal();
            s.on(listener);
            
            s.$$emit(2);
            assert.equal(res, 2);
            
        });
        
        it('should not call registred listeners', function(){
            var res;
            function listener(v) {
                res = v;
            }
            var s = new Signal();
            
            s.on(listener);
            s.$$emit(2);
            assert.equal(res, 2);
            
            s.off(listener);
            s.$$emit(4);
            assert.equal(res, 2);
            
        });
        
        it('should keep current value for continous signal', function(){
            var s = new Signal(0);
            assert.equal(s.$$currentValue, 0);
            
            s.$$emit(2);
            assert.equal(s.$$currentValue, 2);
            
        });
    });
    
});