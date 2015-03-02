var assert = require("assert")
var ss = require("../src/reactive.js");

describe('ss', function(){
    
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
    
    describe('#bState()', function(){
        
        it('should bind on/off state to 2 events', function() {
            var sOn = ss.signal(),
                sOff = ss.signal(),
                sig = ss.bState(false, sOn, sOff);
        
            sOn.$$emit();
            assert.equal(sig.$$currentValue, true);
            
            sOff.$$emit();
            assert.equal(sig.$$currentValue, false);
            
            sOn.$$emit();
            assert.equal(sig.$$currentValue, true);
            sOn.$$emit();
            assert.equal(sig.$$currentValue, true);
            
            sOff.$$emit();
            assert.equal(sig.$$currentValue, false);
            sOff.$$emit();
            assert.equal(sig.$$currentValue, false);
        });
        
        it('should switch on/off state on one event occrunce', function() {
            var sOn = ss.signal(),
                sig = ss.bState(false, sOn);
        
            sOn.$$emit();
            assert.equal(sig.$$currentValue, true);
            
            sOn.$$emit();
            assert.equal(sig.$$currentValue, false);
        });
    });
    
})

describe('Signal.prototype', function() {
    describe('#$$emit()', function(){
        it('should keep current value for continous signal', function(){
            var s = ss.signal(0);
            assert.equal(s.$$currentValue, 0);
            
            s.$$emit(2);
            assert.equal(s.$$currentValue, 2);
            
        });
    });
    
    describe('#map()', function(){
        it('should map signal values to a function', function(){
            var s1 = ss.signal(0),
                s = s1.map(function(v) { 
                    return v * 2; 
                });
            
            s1.$$emit(2);
            assert.equal(s.$$currentValue, 4);
            
        });
        
        it('should map signal values to an array template', function(){
            var s1 = ss.signal({}),
                s = s1.map(['.prop1', '.prop2.nested']);
            
            s1.$$emit({
                prop1: 'p1',
                prop2: {
                    nested: 'pn'
                }
            });
            assert.deepEqual(s.$$currentValue, ['p1', 'pn']);
            
        });
    });
    
    describe('#fold*()', function(){
        
        it('fold()-should fold values of a signal with a seed value', function(){
            var s1 = ss.signal(),
                acc = s1.fold(10, function(v, p) { return v + p; })
            
            assert.equal(acc.$$currentValue, 10);
            
            s1.$$emit(2);
            assert.equal(acc.$$currentValue, 10+2);
            
            s1.$$emit(3);
            assert.equal(acc.$$currentValue, 10+2+3);
            
        });
        
            it('fold0()-should fold values of a stateful signal using signal current value as a seed', function(){
            var s1 = ss.signal(10),
                acc = s1.fold0(function(v, p) { return v + p; })
            
            assert.equal(acc.$$currentValue, 10);
            
            s1.$$emit(2);
            assert.equal(acc.$$currentValue, 10+2);
            
            s1.$$emit(3);
            assert.equal(acc.$$currentValue, 10+2+3);
            
        });
    });
    
    describe('#counter()', function(){
        
        it('should count signal occurrences', function(){
            var s1 = ss.signal(),
                count = s1.counter();
            
            assert.equal(count.$$currentValue, 0);
            
            s1.$$emit(2);
            assert.equal(count.$$currentValue, 1);
            
            s1.$$emit(3);
            assert.equal(count.$$currentValue, 2);
            
        });
    });
    
    describe('#keep()', function(){
        
        it('should keep signal occurrences', function(){
            var s1 = ss.signal(),
                kept = s1.keep(0);
            
            assert.equal(kept.$$currentValue, 0);
            
            s1.$$emit(2);
            assert.equal(kept.$$currentValue, 2);
            
            s1.$$emit(3);
            assert.equal(kept.$$currentValue, 3);
            
        });
    });
    
    describe('#eq()', function(){
        
        it('should lift eq function', function(){
            var s1 = ss.signal(5),
                s2 = ss.signal(3),
                test = s1.eq(s2);
            
            assert.equal(test.$$currentValue, false);
            
            s1.$$emit(3);
            assert.equal(test.$$currentValue, true);
            
            s2.$$emit(4);
            assert.equal(test.$$currentValue, false);
            
        });
    });
    
    describe('#whenEq()', function(){
        
        it('should propgates only if 2 signales are equals', function(){
            var res = null,
                s1 = ss.signal(5),
                s2 = ss.signal(3),
                test = s1.whenEq(s2);
            
            test.on(function(v) {
                res = v;
            });
            
            s1.$$emit(3);
            assert.equal(res, true);
            
            res = null;
            s2.$$emit(4);
            assert.equal(res, null);
            
        });
    });
    
});