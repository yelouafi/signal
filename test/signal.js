var assert = require("assert")
var ss = require("../src/reactive.js");

describe('signal', function(){
    
    describe('.Signal', function(){
        it('should keep current value for continous signal', function(){
            var s = ss.signal(0);
            assert.equal(s.$$currentValue, 0);
            
            s.$$emit(2);
            assert.equal(s.$$currentValue, 2);
            
        });
    });
   
    describe('#collect()', function(){
        var result,
            s1 = ss.signal(0),
            s2 = ss.signal(),
            coll = ss.collect([s1, s2], function(values, src, idx) {
                result = { values: values, src: src, idx: idx };
            });
        it('should call handler when activated ', function(){
            coll.activate();
            s1.$$emit(1);
            assert.deepEqual(result.values, [1, ss.neant] );
            assert.equal(result.src, s1);
            assert.equal(result.idx, 0);
            
            s2.$$emit(2);
            assert.deepEqual(result.values, [1, 2] );
            assert.equal(result.src, s2);
            assert.equal(result.idx, 1);
        });
        
        it('should not call handler when deactivated ', function(){
            coll.deactivate();
            result = null;
            s1.$$emit(1);
            assert.equal(result, null);
        });
    });
    
    describe('#combine()', function(){
        var result,
            s1 = ss.signal(0),
            s2 = ss.signal(),
            coll = ss.combine([s1, s2], function(values, src, idx) {
                result = { values: values, src: src, idx: idx };
            });
        it('should call handler when activated ', function(){
            coll.activate();
            s1.$$emit(1);
            assert.deepEqual(result.values, [1, ss.neant] );
            assert.equal(result.src, s1);
            assert.equal(result.idx, 0);
            
            s2.$$emit(2);
            assert.deepEqual(result.values, [1, 2] );
            assert.equal(result.src, s2);
            assert.equal(result.idx, 1);
        });
        
        it('should not call handler when deactivated ', function(){
            coll.deactivate();
            result = null;
            s1.$$emit(1);
            assert.equal(result, null);
        });
        
        it('should update .$$sources and .$$deps when activated ', function(){
            coll.activate();
            assert.deepEqual(coll.$$sources, [s1, s2] );
            assert(s1.$$deps.indexOf(coll) >= 0);
            assert(s2.$$deps.indexOf(coll) >= 0);
        });
        
        it('should evaluate startValue when not given discr parameter', function() {
            var A = ss.signal(1), B = ss.signal(2), C = ss.signal(3),
                sum = ss.combine([A,B,C], function (values, src, idx) {
                    return values[0] + values[1] + values[2];
                });
                assert.equal(sum.$$currentValue, 1+2+3);
        });
        
        it('should not evaluate startValue when  when given discr parameter', function() {
            var A = ss.signal(1), B = ss.signal(2), C = ss.signal(),
                sum = ss.combine([A,B,C], function (values, src, idx) {
                    return values[0] + values[1] + values[2];
                }, true);
                assert.equal(sum.$$currentValue, ss.neant);
        });
        
        it('should propagate when the returned value is not neant', function() {
            var called;
            var A = ss.signal(1), B = ss.signal(2), C = ss.signal(),
                sum = ss.combine([A,B,C], function () {
                    return 'whatever';
                }).on(function(v) {
                    called = true;
                });
                A.$$emit(2);
                assert(called);
        });
        
        it('should not propagate when the returned value is neant', function() {
            var called;
            var A = ss.signal(1), B = ss.signal(2), C = ss.signal(),
                sum = ss.combine([A,B,C], function () {
                    return ss.neant;
                }).on(function(v) {
                    called = true;
                });
                A.$$emit(2);
                assert(!called);
        });
    });
    
    describe('#map()', function(){
        it('should not map if any input value is neant', function() {
            var called;
            var A = ss.signal(1), B = ss.signal(2), C = ss.signal(),
                sum = ss.map(A,B,C, function (a, b, c) {
                    return a+b+c;
                });
                sum.on(function(v) {
                    called = true;
                });
                assert.equal( sum.$$currentValue, ss.neant );
                A.$$emit(2);
                assert(!called);
        });
        
        it('should map if none of input values is neant', function() {
            var res;
            var A = ss.signal(1), B = ss.signal(2), C = ss.signal(),
                sum = ss.map(A,B,C, function (a, b, c) {
                    return a+b+c;
                });
                sum.on(function(v) {
                    res = v;
                });
                assert.equal( sum.$$currentValue, ss.neant );
                C.$$emit(2);
                assert.equal(res, 1+2+2);
        });
    });
    
    describe('#merge()', function(){
        it('should merge signals', function() {
            var called;
            var A = ss.signal(), B = ss.signal(),
                sig = ss.merge(A, B);
                sig.on(function(v) {
                    called = true;
                });
                
                A.$$emit(1);
                assert(called);
                
                called = false;
                B.$$emit(1);
                assert(called);
        });
    });
    
    describe('#array()', function(){
        it('should map array of signals into a signal of array', function() {
            var res;
            var arr = [ss.signal(1), ss.signal(2)],
                sig = ss.array(arr);
                sig.on(function(v) {
                    res = v;
                });
                assert.deepEqual(sig.$$currentValue, [1, 2]);
                
                arr[0].$$emit(10);
                assert.deepEqual(res, [10, 2]);
        });
    });
    
    describe('#obj()', function(){
        it('should map object of signals into a signal of object', function() {
            var res;
            var obj = { a: ss.signal(1), b: ss.signal(2) },
                sig = ss.obj(obj);
                sig.on(function(v) {
                    res = v;
                });
                assert.deepEqual(sig.$$currentValue, {a: 1, b: 2});
                
                obj.a.$$emit(10);
                assert.deepEqual(res, {a: 10, b: 2});
        });
    });
    
    describe('#lift()', function(){
        var A = ss.signal(1), B = ss.signal(2);
        
        it('should lift function over static values to function over signals', function() {
            function add(a, b) {
                return a+b   
            }
            
            var Add = ss.lift(add),
                sig = Add(A, B);
            
            assert.equal(sig.$$currentValue, 1+2);
            
            A.$$emit(10);
            assert.equal(sig.$$currentValue, 10+2);
        });
        
        it('should lift and function ', function() {
            var C = ss.signal(false),
                sig = ss.and(A, B, C);
            
            assert.equal(sig.$$currentValue, false);
            
            C.$$emit(true);
            assert.equal(sig.$$currentValue, true);
        });
        
        it('should lift or function ', function() {
            var C = ss.signal(false),
                sig = ss.or(A, B, C);
            
            assert.equal(sig.$$currentValue, true);
            
            A.$$emit(false);
            assert.equal(sig.$$currentValue, true);
            
            B.$$emit(false);
            assert.equal(sig.$$currentValue, false);
        });
    });
    
    describe('#filter()', function(){
        it('should filter out values that dont meet a condition', function() {
            var res = null,
                src = ss.signal(),
                sig = ss.filter(src, function(v) { return v > 5; });
            
            sig.on(function(v) { res = v });
            
            src.$$emit(3);
            assert.equal(res, null);
            
            src.$$emit(6);
            assert.equal(res, 6);
        });
    });
        
    describe('#def()', function(){
        it('should start with the initial value', function() {
            var sig = ss.def(1, [ss.never(), function() {}]);
            
            assert.equal(sig.$$currentValue, 1);
        });
        
        it('should apply the function corresponding to a reaction', function() {
            var add = ss.signal(1), sub = ss.signal(),
                sig = ss.def(1, 
                    [ add, function(val, prev) {  return val + prev } ],
                    [ sub, function(val, prev) {  return prev - val } ]
                );
            
            add.$$emit(10);
            assert.equal(sig.$$currentValue, 10+1);
            
            sub.$$emit(5);
            assert.equal(sig.$$currentValue, 10+1-5);
        });
    });    
})