(function() {

window.ss = { 	neant: neant, signal: signal, collect: collect, combine: combine, or: or, and: and, map: smap, def: def, slot: slot, if: iif,
				lift: lift, reduce: sreduce, cycle: cycle, array: array,
				timer: timer, seconds: seconds, clock: clock, assign: assignDom, printGraph: printGraph 
			}

var sfns = window.ss.fn = { noop: noop, 
	logger: logger, isStr: isStr, isObj: isObj, isFn: isFn, isSig: isSig, occ: occ, 
	eq: eq, notEq: notEq, gt: gt, gte: gte, lt: lt, lte: lte, not: not, inc: inc, 
	or: or, and: and, id: id, val: valFn, makeFn: makeFn, callwArg: callwArg, call: call, propGetter: propGetter, objGetter: objGetter, getProp: getProp,
	each: each, map: map, eachKey: eachKey, mapObj: mapObj, any: any, first: first, pipe: pipe, filter: filter, reducer: reducer,
	templateArr: templateArr, templateObj: templateObj, template: template
};


var neant = new function Neant() {}

var slice 					= Array.prototype.slice;
function logger(prefix) 	{ return function(msg) { console.log( prefix, msg ); } };
function isStr(arg) 		{ return (typeof arg === 'string'); }
function isObj(arg) 		{ return arg && (typeof arg === 'object'); }
function isFn(arg) 			{ return (typeof arg === 'function') ; }
function isSig(arg) 		{ return arg && arg.$$sig; }
function occ(sig)			{ return sig.occ; }
function noop() 			{}
function eq(v1, v2) 		{ return v1 === v2; }
function notEq(v1, v2) 		{ return v1 !== v2; }
function gt(v1, v2) 		{ return v1 < v2; }
function gte(v1, v2) 		{ return v1 <= v2; }
function lt(v1, v2) 		{ return v1 > v2; }
function lte(v1, v2) 		{ return v1 >= v2; }
function not(val) 			{ return !val; }
function inc(v)				{ return v+1 }
function or()				{ return any( arguments, id ); }
function and()				{ return first( arguments, not ) === -1 }
function id(val) 			{ return val; }
function valFn(val) 		{  return function() { return val; } }
function makeFn(arg, alt) 	{ return isFn(arg) ? arg : (alt || valFn(arg)); }
function callwArg(arg, fn)	{ return fn(arg); }
function call(fn) 			{ return fn(); }
function propGetter(prop) 	{ return function(o) { return o[prop]; } }
function objGetter(obj) 	{ return function(prop) { return obj[prop]; } }

function each(iter, cb) {
	for(var i = 0, l = iter.length; i < l; i++)
		cb(iter[i], i);
}
function eachKey(obj, cb) {
	var keys = Object.keys(obj);
	for(var i = 0, l = keys.length; i < l; i++) {
		var key = keys[i];
		cb( obj[ key ], key );
	}
}
function any(iter, test) {
	test = makeFn(test, eq.bind(null, test));
	for(var i = 0, l = iter.length; i < l; i++)
		if ( test( iter[i] ) ) return true;
	return false;
}
function first(iter, test) {
	test = makeFn(test, eq.bind(null, test));
	for(var i = 0, l = iter.length; i < l; i++)
		if ( test( iter[i] ) ) return i;
	return -1;
}
function map(iter, cb) {
	cb = makeFn(cb);
	var res = new Array(iter.length);
	for(var i = 0, l = iter.length; i < l; i++)
		res[i] = cb(iter[i], i);
	return res;
}
function mapObj(obj, cb) {
	cb = makeFn(cb);
	var res = {};
	each( Object.keys(obj), function( key ) {
		var val = obj[key];
		if( isObj( val ) ) {
			res[key] = mapObj( val, cb );
		} else
			res[key] = cb( val, key );
	});
	return res;
}
function pipe(fns, canContinue) {
	canContinue = canContinue || valFn(true);
	fns = map(fns, function (p) { return p ? makeFn(p) : id; } );
	return function preproc(val) {
		var res = val;
		for(var i = 0, l = fns.length; i < l; i++) {
			res = fns[i](res);
			if( !canContinue(res, i) ) return res;
		}
		return res;
	}
}

function templateArr (fns, target) 		{ return map( fns, callwArg.bind( null, target ) ); }
function templateObj( proto, target ) 	{ return mapObj( proto, callwArg( null, target ) ); }
function getProp(path, obj) 			{ return pipe( map( path, propGetter ), isObj )(obj); }

function filter(iter, test) {
	test = makeFn(test, eq.bind(null, test));
	var res = [];
	for(var i = 0, l = iter.length; i < l; i++) {
		var val = iter[i];
		if(test(val))
			res.push(val);
	}
	return res;
}

function reducer( startValue, fn ) {
	var currentValue = startValue;
	fn = makeFn( fn );
	return function( value ) {
		return ( currentValue = fn( currentValue, value ) );
	}
}

function template( config, defEl ) {
	var tpl = makeGetter( config );
	if( Array.isArray( tpl ) ) {
		return templateArr.bind( null, tpl );
	} else if( isObj( tpl ) ) {
		return templateObj.bind( null, tpl );
	} else
		return tpl;
	
	function scalar(val, el) {
		var prefix;
		if( isStr(val) && ( (prefix = val[0]) === '#' || prefix === '.' ) ) {
			var parts = val.split('.'),
				target = parts[0], 
				path = parts.slice(1);
			if( prefix === '#' /* #.value -> el.value, #idOfEl.value -> elById(idOfEl).value */) {
				var elObj = ( target.length > 1 && document.querySelector(target) ) || el || document;
				return getProp.bind( null, path,  elObj);
			} else if( prefix === '.' /* .target.value -> event.target.value */ )
				return getProp.bind( null, path );
		} else {
			return makeFn(val).bind(el);
		}
	}

	function makeGetter( param, defEl ) {
		if( Array.isArray( param ) )
			return map( param, makeGetter );
		else if( isObj( param ) )
			return mapObj( param, makeGetter );
		else
			return scalar( param, defEl );
	}
}


function Event() { 
	this.slots = []; 
}

Event.prototype.on = function(slot) {
	if( this.slots.indexOf(slot) < 0 )
		this.slots.push(slot);
};

Event.prototype.off = function(slot) {
	var idx = this.slots.indexOf(slot);
	if( idx >= 0)
		this.slots.splice(idx, 1);
};

Event.prototype.emit = function (data) { 
	each( this.slots, callwArg.bind( null, data ) ) 
};

function signal() {
	var startValue = arguments.length ? arguments[0] : neant,
		discrete = ( startValue === neant ),
		currentValue = startValue,
		valueEvent = new Event(),
		log = null;
	
	sigval.log = function(prefix) { 
		log = makeFn(prefix, logger(prefix)); 
		sigval.$$log = prefix;
		return sigval; 
	}
	
	sigval.$$log = currentValue;
	sigval.$$sig = true;
	sigval.$$sources = [];
	each( ['on', 'off'], function( method ) { 
		sigval[method] = valueEvent[method].bind(valueEvent) 
	} );
	
	sigval.$$emit = function( val ) {
		if(log) log(val);
		currentValue = val;
		valueEvent.emit( val );
		if( discrete )
			currentValue = neant;
	}
	sigval.map = function( getter, el ) { return smap( sigval, template(getter, el) )};
	sigval.reduce = sreduce.bind( null, sigval );
	sigval.filter = sfilter.bind(null, sigval);
	each( ['eq', 'gt', 'gte', 'lt', 'lte'], function( key ) {
		var fn = sfns[key];
		sigval[ key ] = function( val ) { return smap( sigval, fn.bind(null, val) ); };
		sigval[ 'when'+key.charAt(0).toUpperCase() + key.slice(1) ] = function( val ) { return sfilter( sigval, fn.bind(null, val) ); }
	});
	sigval.and = and.bind( null, sigval );
	sigval.or = or.bind( null, sigval );
	sigval.counter = sreduce.bind( null, sigval, 0, inc );
	sigval.occ = discrete ? sigval : or( sigval );
	sigval.$to = assignDom.bind( null, sigval );
	
	function sigval() { return currentValue; }
	return sigval;
}

function collect( sources, cb ) {
	var res = {};
	res.sources = map( sources, function( s ) { return isSig( s ) ? s : signal(s); });
	res.startValues = values();
	res.handlers = map( res.sources, handler );
	res.log = '[' + map( res.sources, function(s) { return s.$$log }).join(', ') + ']';	
	res.activate = each.bind( null, res.sources, connect );
	res.deactivate = each.bind( null, res.sources, disconnect );
	return res;
	
	function values() { return map( res.sources, call ); }
	function handler( src, idx ) {
		return function ( val ) { cb( values(), src, idx ); }
	}
	
	function connect(src, idx) 		{ src.on( res.handlers[idx] ); }
	function disconnect(src, idx) 	{ src.off( res.handlers[idx] ); }
}

function combine( sources, fn ) {
	sources = map( sources, function( s ) { return isObj( s ) ? combineObj( s ) : s; });
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

function combineObj( obj ) {
	var args = [], keys = Object.keys(obj);
	eachKey( keys, function( key ) { args.push( obj[key] ); });
	return combine( args, handle );
	
	function handle( values, src, idx ) {
		var res = {};
		each( keys, function( key, idx ) {
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
	var args = Array.isArray( arguments[0] ) ? arguments[0] : slice.call( arguments );
	return combine( args, function( values, src, _ ) {
		return src ? src() : neant;
	});
}

function and() {
	var args = Array.isArray( arguments[0] ) ? arguments[0] : slice.call( arguments );
	return combine( args, function( values, src, _ ) {
		return src && !any( values, neant ) ? src() : neant;
	});
}

function iif( cond, then, elze ) {
	return smap( cond, then, elze, function( c, th, el ) {
		return c ? th : el;
	} )
}

function smap() {
	var args = Array.isArray( arguments[0] ) ? arguments[0] : slice.call( arguments ),
		fn = makeFn( args.pop() );
		
	return combine( args, function( values, src, _ ) {
		return any( values, neant ) ? neant : fn.apply( null, values );
	} );
}

function def( start, reactions /*, ... */ ) {
	var sources = map( discr(slice.call(arguments, 1)), smap );
	return combine( sources, function( values, src, _ ) {
		return !src ? start : src();
	});
	
	function discr( reacs ) {
		return map( reacs, function(r) {  
			return [ r[0].occ ].concat( r.slice( 1 ) );	} 
		);	
	}
}

function lift( fn ) {
	return function() {
		return smap( [].concat( slice.call( arguments ), fn ) );
	}
}

function sfilter( source, test ) {
	return def( neant,
		[source, function(v) { return test(v) ? v : neant; }]
	);
}

function sreduce( source, startValue, fn ) {
	return def( startValue,
		[source, reducer(startValue, fn)]
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

function assignDom( sig, el, prop ) {
	el = el instanceof Element ? el : document.querySelector(el);
	if( sig() !== neant )
		el[ prop || 'textContent' ] = sig();
	sig.on(function(v) {
		el[ prop || 'textContent' ] = v;
	});
	return sig;
}

function printGraph( sig, level ) {
	level = level || 0;
	console.log( indent(level) + sig.$$log );
	each( sig.$$sources, function(s) {
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