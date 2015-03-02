var assert = require("assert")
var _ = require("../src/static.js");

describe('_', function() {
    
    describe('#template', function() {
        var obj = {
            prop1: 'p1',
            prop2: {
                nested: 'pn'
            },
            meth: function (val) { return val * 2 }
        };
        it('should extract properties from its argument to a scalar valuee', function() {
            var fn = _.template('.prop1');
            
            assert.equal(fn(obj), 'p1');
        });
        
        it('should also extract nested properties', function() {
            var fn = _.template('.prop2.nested');
            
            assert.equal(fn(obj), 'pn');
        });
        
        it('should also extract results of method calls', function() {
            var fn = _.template('.meth()', 5);
            
            assert.equal(fn(obj), 10);
        });
        
        it('should extract properties to an array', function() {
            var fn = _.template(['.prop1', '.prop2.nested'] )
            
            assert.deepEqual(fn(obj), ['p1', 'pn']);
        });
        
        it('should extract properties to an object', function() {
            var fn = _.template({ p1: '.prop1', p2: { nested:  '.prop2.nested' } } );
            
            assert.deepEqual(fn(obj), { p1: 'p1', p2: { nested:  'pn' } });
        });
     
    });
    
});