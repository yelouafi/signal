var _ = require("./base.js"),
	Event = require('./event.js');

var ss = { signal: signal };
    
var neant = ss.neant = new function Neant() {};

ss.isSig = function isSig(arg) { 
    return arg && arg.$$sig; 
};

ss.occ = function occ(sig) { 
    return sig.occ; 
};

ss.never = function never() { 
    return signal();
};

ss.collect = function collect( sources, cb ) {
	var res = {};
	res.sources = _.map( sources, makeSig);
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
	
	function makeSig( s ) { return ss.isSig( s ) ? s : signal(s); }
	function connect(src, idx) 		{ src.on( res.handlers[idx] ); }
	function disconnect(src, idx) 	{ src.off( res.handlers[idx] ); }
};

ss.combine = function combine( sources, fn ) {
	sources = _.map( sources, function(s) { return _.isObj(s) ? combineObj(s) : ( _.isArray(s) ? ss.combineArr(s) : s); });
	var collection = ss.collect( sources, handle );
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
};

ss.combineArr = function combineArr( arr ) {
	return ss.combine( arr, _.id );
};

function combineObj( obj ) {
	var args = [], keys = Object.keys(obj);
	_.each( keys, function( key ) { args.push( obj[key] ); });
	return ss.combine( args, handle );
	
	function handle( values, src, idx ) {
		var res = {};
		_.each( keys, function( key, idx ) {
			var vk = values[idx];
			if( vk !== neant )
				res[key] = vk;
		});
		return res;
	}
};

ss.map = function map() {
	var args = _.isArray( arguments[0] ) ? arguments[0] : _.slice( arguments ),
		fn = _.fn( args.pop() );
		
	return ss.combine( args, function( values, src, __ ) {
		return _.any( values, neant ) ? neant : fn.apply( null, values );
	} );
};

ss.merge = function merge() {
	var args = _.isArray( arguments[0] ) ? arguments[0] : _.slice( arguments );
	return ss.combine( args, function( values, src, __ ) {
		return src ? src() : neant;
	});
};

ss.and = function and() {
	var args = _.isArray( arguments[0] ) ? arguments[0] : _.slice( arguments );
	return ss.combine( args, function( values, src, __ ) {
		return src && _.all( values, trueVal ) ? src() : neant;
	});
	
	function trueVal(val) {
	    return val && val !== neant;
	}
};

ss.def = function def( start, reactions /*, ... */ ) {
	var sources = _.map( discr( _.slice( arguments, 1 ) ), ss.map );
	return ss.combine( sources, function( values, src, __ ) {
		return !src ? start : src();
	});
	
	function discr( reacs ) {
		return _.map( reacs, function(r) {  
			return [ r[0].occ ].concat( r.slice( 1 ) );	} 
		);	
	}
};

ss.lift = function lift( fn ) {
	return function() {
		return ss.map( [].concat( _.slice( arguments ), fn ) );    
	};
};

ss.filter = function filter( source, test ) {
	test = _.fn( test, _.eq(test) );
	return ss.def( neant,
		[source, function(v) { return test(v) ? v : neant; }]
	);
};

ss.fold = function fold( source, startValue, fn ) {
	return ss.def( startValue,
		[ source, _.ffold( startValue, fn ) ]
	);
};

ss.if = function iif( cond, then, elze ) {
	return ss.map( cond, then, elze, function( c, th, el ) {
		return c ? th : el;
	});
};

ss.cycle = function cycle(source, args /* ... */) {
	var occ = source.fold( 0, _.inc );
    args = _.slice(arguments, 1);
	return ss.map( occ.concat(args), function( o, vargs /* ... */) {
	    vargs = _.slice(arguments, 1);
		return vargs[o % args.length];
	});
};

ss.array = function array( arr, add, remove ) {
	arr = arr || [];
	var changes = {};
	var len = function() { return arr.length };
	var res = ss.def( arr,
		[add, 		function(v) { arr.push(v); return arr; }],
		[remove, 	function(v) {  
			var idx = arr.indexOf(v); 
			if( idx >= 0) arr.splice(idx, 1); 
			return arr;
		}]
	);
	res.len = res.reduce( len(), len );
	return res;
}

ss.obj = function obj(conf) {
	return ss.map(conf, _.id);
};

ss.bstate = function bstate(start, evOn, evOff) {
	return ss.def( start, 
	    [evOn, true],
	    [evOff, false]
    );
};

ss.flatMap = function flatMap(event) {
    var emitter = signal(),
		sigList = [],
		curSrc = null,
		higherSrc = ss.map(event, addSig);
		
    return emitter;
    
    function addSig( newSig ) {
		sigList.push(newSig);
		curSrc && curSrc.deactivate();
		curSrc = ss.map( ss.merge( sigList ), emitter.$$emit.bind(emitter) );
	}
};

ss.switch = function sswitch( startSig, event ) {
    startSig = ss.isSig(startSig) ? startSig : signal(startSig);
    
    var emitter = new signal( startSig() ),
		curSrc = setSig( startSig ),
		higherSrc = ss.map(event, setSig);
    
    return emitter;
    
    function setSig( newSig ) {
		var start = !curSrc;
		curSrc && curSrc.deactivate();
		curSrc = ss.map( newSig, emitter.$$emit.bind(emitter) );
		!start && emitter.$$emit( newSig() );
	}
};

ss.timer = function timer ( prec, stop ) {
	var sig = signal( Date.now() ),
		iv = start(),
		count = isFinite(stop) ? stop : 0;
		
	if( ss.isSig(stop) )
		stop.on( stopTimer );
		
	return sig;

	function start() { 
	    return setInterval( emit, prec );
	}
	
	function emit() { 
		sig.$$emit( Date.now() );
		if ( count && (--count) <= 0 ) 
			clearInterval( iv );
		
	}
	function stopTimer() {
		if(iv) clearInterval( iv );
		stop.off( stopTimer );
	}
};

ss.clock = function clock( stop ) {
	return ss.timer( 1000, stop ).map( function( ms ) { return new Date(ms); } )
};

ss.seconds = function seconds( stop ) {
	return ss.timer( 1000, stop ).counter();
};

function signal() {
	var startValue = arguments.length ? arguments[0] : neant,
		discrete = ( startValue === neant ),
		currentValue = startValue,
		valueEvent = new Event(),
		log = null;
	
	sigval.$$logPrefix = currentValue;
	sigval.$$sig = true;
	sigval.$$sources = [];
	
	sigval.log = function(prefix) { 
		log = _.fn( prefix, _.logger(prefix) ); 
		sigval.$$logPrefix = prefix;
		return sigval; 
	}
	
	
	_.each(['on', 'off'], function( method ) { 
		sigval[method] = valueEvent[method].bind(valueEvent) 
	});
	
	sigval.$$emit = function( val ) {
		if(log) log(val);
		currentValue = val;
		valueEvent.emit(val);
		if( discrete )
			currentValue = neant;
	};
	
	sigval.map = function( getter, args /*...*/ ) {
	    args = _.slice(arguments,1);
		return ss.map( sigval, _.fapply.apply( null, [].concat( getter, args ) ) )
	};
	
	sigval.val = function (val) {
		return ss.map( sigval, _.val(val) );
	};
	
	sigval.fold = _.bindl( ss.fold, sigval );
	
	sigval.filter = _.bindl( ss.filter, sigval);
	_.each( ['eq', 'notEq', 'gt', 'gte', 'lt', 'lte'], function( key ) {
		var fpred = _[key];
		sigval[key] = function(val) { 
		    return ss.map( sigval, fpred(val) );
		};
		
		var whenKey = 'when'+key.charAt(0).toUpperCase() + key.slice(1);
		sigval[whenKey] = function(val) { 
		    return ss.filter( sigval, fpred(val) ); 
		};
	});
	
	sigval.not = function() {
		return ss.map(sigval, function(v) { return !v });
	}
	
	sigval.and = _.bindl( ss.and, sigval );
	
	sigval.merge = _.bindl( ss.merge, sigval );
	
	sigval.counter = _.bindl( ss.fold, sigval, 0, _.inc );
	
	sigval.occ = discrete ? sigval : ss.merge( sigval );
	
	sigval.tap = function(proc) {
		return ss.map(sigval, function(v) {
			proc(v);
			return v;
		})
	}
	
	function sigval() { return currentValue; }
	
	return sigval;
}


module.exports = ss;