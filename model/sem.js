
function reactive() {
    
    function r() {}
    
    function onEvent(ev, startTime) {
        var lastOcc = -1;
        var res = event;
        res.map = map;
        return res;
        
        function event(t) {
            return isFinite(startTime) ? 
                    occAfter(ev, startTime) : 
                    occAfter(ev, t);
        }
        
        function map(f) {
            return function(t) {
                var ev = event(t);
                if(ev === future) return future;
                return new Event(
                        ev.type,
                        ev.t, 
                        (typeof f !== 'function') || f.$$frpRocks ? f : f.call(ev, ev.val, ev.t)
                );
            };
        }
    }
    
    function occAfter(ev, t) {
        var evs = events[ev];
        if(evs && evs.length && evs[evs.length-1].t > t ) {
            for(var i = evs.length-1; i >= 0; i--) {
                if(evs[i].t < t) {
                    return evs[i-1];
                }
            }
            return evs[evs.length-1];
        }
        return future;
    }
    
    var gt = 0,
        events = {},
        future = new Event('Future', Infinity, undefined);
    
    r.$$events = events;
    r.on = onEvent;
    r.future = future;
    r.time = beh(function(t) {
        return t;
    });
    r.val = function(val) {
        return beh(function(t) {
            return val;    
        });
    };
    r.beh = beh;
    r.lift = lift;
    
    r.start = function(eventSource) {
        eventSource.on(function(e) {
            var dict = events[e.type] || (events[e.type] = []);
            dict.push(new Event(e.type, (++gt-0.5), e.data));
        });
    }
    return r;
    
    
    function lift(val) {
        return  typeof val !== 'function'   ? r.val(val) :
                val.$$frpRocks              ? val :
                liftFn;
                
        function liftFn(fn) {
            return function() {
                var argsB = Array.prototype.slice.call(arguments);
                return function (t) {
                    return fn.call(this, argsB.map(function(beh) {
                        return beh(t);
                    }));
                }
                
            }
        }
    }

    function Event(type, t, data) {
        this.type = type;
        this.t = t;
        this.val = data;
    }
    
    function until(beh, evGet) {
        beh = makeBeh(beh);
        return function(t) {
            var ev = evGet(t);
            if( t < ev.t )
                return beh(t)    
            else
                return makeBeh(ev.val)(t);
        }
    }
    
    function beh(getter) {
        var getB = memoize(getter);
        getB.until = until.bind(null, getter);
        getB.$$frpRocks = true;
        return getB;
    }
    
    function isBeh(arg) {
        return typeof arg === 'function' || arg.$$frpRocks;
    }
    
    function makeBeh(arg) {
        return isBeh(arg) ? arg : r.val(arg);
    }
    
    function memoize(fn) {
        var cache = [];
        return function(t) {
            return cache[t] || ( cache[t] = fn(t) );
        }
    }
}

module.exports = reactive;


