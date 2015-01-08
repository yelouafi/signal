(function() {

var _ = window.ss_;
window.ss = { 	neant: neant, signal: signal, collect: collect, combine: combine, or: or, and: and, map: smap, def: def, slot: slot, if: iif, switch: sswitch,
				lift: lift, reduce: sreduce, cycle: cycle, array: array, fsm: fsm,
				timer: timer, seconds: seconds, clock: clock, assign: assign, printGraph: printGraph 
			}

var neant = new function Neant() {}
function isSig(arg) { return arg && arg.$$sig; };
function occ(sig) { return sig.occ; };

function Event() { this.slots = []; }
Event.prototype.on    = function(slot) 	{ _.add( this.slots, slot, true ); };
Event.prototype.off   = function(slot) 	{ _.remove( this.slots, slot; ) };
Event.prototype.emit  = function (data) {  _.each( this.slots, _.callw( data ) ) };

function signal() {
	var startValue = arguments.length ? arguments[0] : neant,
		discrete = ( startValue === neant ),
		currentValue = startValue,
		valueEvent = new Event(),
		log = null;
	
	sigval.log = function(prefix) { 
		log = _.fn( prefix, _.logger(prefix) ); 
		sigval.$$log = prefix;
		return sigval; 
	}
	
	sigval.$$log = currentValue;
	sigval.$$sig = true;
	sigval.$$sources = [];
	_.each( ['on', 'off'], function( method ) { 
		sigval[method] = valueEvent[method].bind(valueEvent) 
	} );
	
	sigval.$$emit = function( val ) {
		if(log) log(val);
		currentValue = val;
		valueEvent.emit( val );
		if( discrete )
			currentValue = neant;
	}
	sigval.map = function( getter, args /***/ ) { 
		return smap( sigval, _.fapply.apply( null, [].concat( getter, _.slice(arguments,1) ) ) )
	};
	sigval.reduce = _.bindl( sreduce, sigval );
	sigval.filter = _.bindl( sfilter, sigval);
	_.each( ['eq', 'gt', 'gte', 'lt', 'lte'], function( key ) {
		var fpred = _[key];
		sigval[key] = function(val) { return smap( sigval, fpred(val) ); };
		sigval[ 'when'+key.charAt(0).toUpperCase() + key.slice(1) ] = function( val ) { return sfilter( sigval, fpred(val) ); }
	});
	sigval.and = _.bindl( and, sigval );
	sigval.or = _.bindl( or, sigval );
	sigval.counter = _.bindl( sreduce, sigval, 0, _.inc );
	sigval.occ = discrete ? sigval : or( sigval );
	sigval.$to = _.bindl( assign, sigval );
	
	function sigval() { 
		if( DepsTracker.tracking() ) DepsTracker.addDep( sigval );
		return currentValue; 
	}
	return sigval;
}

function collect( sources, cb ) {
	var res = {};
	res.sources = _.map( sources, msig);
	res.startValues = values();
	res.handlers = _.map( res.sources, handler );
	res.log = '[' + _.map( res.sources, function(s) { return s.$$log }).join(', ') + ']';	
	res.activate = _.bindl(_.each, res.sources, connect );
	res.deactivate = _.bindl(_.each, res.sources, disconnect );
	return res;
	
	function values() { return _.map( res.sources, _.callw() ); }
	function handler( src, idx ) {
		return function ( val ) { cb( values(), src, idx ); }
	}
	
	function msig( s ) { return isSig( s ) ? s : signal(s); }
	function connect(src, idx) 		{ src.on( res.handlers[idx] ); }
	function disconnect(src, idx) 	{ src.off( res.handlers[idx] ); }
}

function combine( sources, fn ) {
	sources = _.map( sources, function( s ) { return _.isObj( s ) ? combineObj( s ) : s; });
	var collection = collect( sources, handle );
	var sig = signal( fn( collection.startValues, null, -1 ) );
	sig.$$sources = collection.sources;
	sig.$$log = collection.log;
	sig.activate = collection.activate;
	sig.deactivate = collection.deactivate;
	collection.activate();
	return sig;
	
	function handle( values, src, idx ) {
		var retv = fn( values, src, idx );
		if( retv !== neant )
			sig.$$emit( retv );
	}
}

function computed(fn) {
	var curSrc, sig = signal( invoke() );
	sig.activate = function() { curSrc && curSrc.activate; }
	sig.deactivate = function() { curSrc && curSrc.deactivate; }
	return sig;
	
	function invoke(values, src, idx) {
		curSrc && curSrc.deactivate();
		var res = DepsTracker.invoke(fn);
		curSrc = combine( res.deps, invoke );
		sig.$$emit(res.result);
	}
}
DepsTracker.stack	= [];
DepsTracker.invoke = function(fn) {
	DepsTracker.stack.push([]);
	var res = fn();
	return { deps: DepsTracker.stack.pop(), result: res };
}
DepsTracker.tracking	= function() 	{ DepsTracker.stack.length; };
DepsTracker.addDep		= function(dep) { return _.add( DepsTracker.stack, dep, true ); }

function sswitch( startSig, events /* ... */ ) {
	events = _.slice(arguments, 1);
	return computed(handle);
	
	function handle( values, src, idx ) {
		if(!src) {
			_.each( events, _.callw() );
			return startSig();
		} else {
			return src()();
		}
	}
}


function combineObj( obj ) {
	var args = [], keys = Object.keys(obj);
	_.eachKey( keys, function( key ) { args.push( obj[key] ); });
	return combine( args, handle );
	
	function handle( values, src, idx ) {
		var res = {};
		_.each( keys, function( key, idx ) {
			var vk = values[idx];
			if( vk !== neant )
				res[key] = vk;
		});
		return res;
	}
}


function slot( fn ) {
	var src = null;
	return function slotFn( s ) {
		src && src.deactivate();
		src = smap( s, function(v) { fn(v); } );
		return s;
	}
}

function or() {
	var args = _.isArray( arguments[0] ) ? arguments[0] : _.slice( arguments );
	return combine( args, function( values, src, __ ) {
		return src ? src() : neant;
	});
}

function and() {
	var args = _.isArray( arguments[0] ) ? arguments[0] : _.slice( arguments );
	return combine( args, function( values, src, __ ) {
		return src && !any( values, neant ) ? src() : neant;
	});
}

function iif( cond, then, elze ) {
	return smap( cond, then, elze, function( c, th, el ) {
		return c ? th : el;
	} )
}

function smap() {
	var args = _.isArray( arguments[0] ) ? arguments[0] : _.slice( arguments ),
		fn = _.fn( args.pop() );
		
	return combine( args, function( values, src, __ ) {
		return _.any( values, neant ) ? neant : fn.apply( null, values );
	} );
}

function def( start, reactions /*, ... */ ) {
	var sources = _.map( discr( _.slice( arguments, 1 ) ), smap );
	return combine( sources, function( values, src, __ ) {
		return !src ? start : src();
	});
	
	function discr( reacs ) {
		return _.map( reacs, function(r) {  
			return [ r[0].occ ].concat( r.slice( 1 ) );	} 
		);	
	}
}

function fsm( state, transitions /*, ... */ ) {
	var sources = _.map( _.slice(arguments, 1), connect );
	return combine( sources, function( values, src, __ ) {
		return ( !src ? state : (state = src()) )[1];
	});
	
	function connect( evtr ) {
		var ev = evtr[0], tr = evtr[1];
		return smap( ev.occ, function( v ) {
			var ctr = _.fn(tr, _.isObj (tr) ? tr[state[0]] || tr['*'] : _.id );
			return ctr(state[1], v);
		})
	}
}

function lift( fn ) {
	return function() {
		return smap( [].concat( _.slice( arguments ), fn ) );
	}
}

function sfilter( source, test ) {
	test = _.fn( test, _.eq(test) );
	return def( neant,
		[source, function(v) { return test(v) ? v : neant; }]
	);
}

function sreduce( source, startValue, fn ) {
	return def( startValue,
		[ source, _.freduce( startValue, fn ) ]
	);
}

function cycle(source, first, second) {
	var occ = event.reduce( 0, inc );
	return smap( occ, first, second, function( o, f, s) {
		return o % 2 === 0 ? f : s;
	} )
}

function array( arr, add, remove ) {
	arr = arr || [];
	var len = function() { return arr.length };
	var res = def( arr,
		[add, 		function(v) { arr.push(v); return arr; }],
		[remove, 	function(v) {  
			var idx = arr.indexOf(v); 
			if( idx >= 0) arr.splice(idx, 1); 
			return arr;
		}]
	);
	
	res.len = res.reduce( len, len() );
	return res;
}

function timer( prec, stop ) {
	var sig = signal( Date.now() ),
		iv = start(),
		count = isFinite(stop) ? stop : 0;
		sc = count;
	if( isSig(stop) )
		stop.on( stopTimer );
	return sig;

	function start() { return setInterval( emit, prec ); }
	function emit() { 
		sig.$$emit( Date.now() );
		if ( count && (--count) <= 0 ) 
			clearInterval( iv );
		
	}
	function stopTimer() {
		if(iv) clearInterval( iv );
		stop.off( stopTimer );
	}
}

function clock( stop ) {
	return timer( 1000, stop ).map( function( ms ) { return new Date(ms); } )
}

function seconds( stop ) {
	return timer( 1000, stop ).counter();
}

function assign( sig, target, prop ) {
	target = _.isStr(target) ? document.querySelector(target) : target;
	var defprop = target instanceof Element ? 'textContent' : '';
	if( sig() !== neant )
		target[ prop || defprop ] = sig();
	sig.on(function(v) {
		target[ prop || defprop ] = v;
	});
	return sig;
}

function printGraph( sig, level ) {
	level = level || 0;
	console.log( indent(level) + sig.$$log );
	_.each( sig.$$sources, function(s) {
		printGraph( s, level+1 )
	});

	function indent(lev) {
		s = ''
		while( (lev--) > 0) {
			s += '....';
		}
		return s;
	}
}

}())