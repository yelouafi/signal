var _ = require("./static.js"),
	Signal = require("./signal.js"),
	neant =  require("./neant.js");

var ss = { neant: neant };

var signal = ss.signal = function(val) {
	var startValue = arguments.length ? val : neant;
	return new Signal(startValue)
}

function isSig(arg) { 
    return arg instanceof Signal; 
};
ss.isSig = isSig;

function sample(sig) {
	return sig.$$currentValue;
}

ss.occ = function occ(sig) { 
    return sig.$$discrete ? sig : ss.merge(sig); 
};

ss.never = function never() { 
    return signal();
};

ss.now = function now(val) { 
    var s = signal();
    setTimeout(s.$$emit.bind(s, val), 0);
    return s;
};

ss.const = function(val) {
	return signal(val);
}

ss.makeSig = function(s) {	
	return isSig( s ) ? s : signal(s);
}

ss.collect = function collect( sources, cb ) {
	var res = {};
	res.sources = _.map( sources, ss.makeSig);
	res.startValues = _.map( res.sources, _.propGetter('$$currentValue'), sample );
	res.handlers = _.map( res.sources, handler );
	res.activate = _.bindl(_.each, res.sources, connect );
	res.deactivate = _.bindl(_.each, res.sources, disconnect );
	return res;
	
	function handler( src, idx ) {
		return function ( val ) { 
			var vals = _.map(res.sources, function(sig, i) {
				return idx === i ? val : sample(sig);
			})
			cb( vals, src, idx ); 
		};
	}
	function connect(src, idx) 		{ src.on( res.handlers[idx] ); }
	function disconnect(src, idx) 	{ src.off( res.handlers[idx] ); }
};

ss.combine = function combine( sources, fn, discr ) {
	sources = _.map( sources, ss.makeSig );
	var collection = ss.collect( sources, handle );
	var sig = signal( !discr ? fn( collection.startValues, null, -1 ) : neant );
	
	sig.activate = function() {
		collection.activate();
		sig.$$sources = collection.sources;
		_.each( sig.$$sources, function (src) {
			_.add(src.$$deps, sig, true);
		});
	};
	sig.deactivate = function() {
		collection.deactivate();
		sig.$$sources = [];
		_.each( sig.$$sources, function (src) {
			_.remove(src.$$deps, sig)
		});
	};
	sig.activate();
	return sig;
	
	function handle( values, src, idx ) {
		var retv = fn( values, src, idx );
		if( retv !== neant )
			sig.$$emit( retv );
	}
};

ss.array = function combineArr( arr ) {
	return ss.combine( arr, _.id );
};

ss.obj = function combineObj( obj ) {
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
	return ss.combine( args, function( values, src, idx ) {
		return src ? values[idx] : neant;
	});
};

ss.lift = function lift( fn ) {
	return function() {
		return ss.map( [].concat( _.slice( arguments ), fn ) );    
	};
};

Function.prototype.lift = function() {
	return ss.lift(this);
}

ss.filter = function filter(sig, test) {
	test = _.fn( test, test instanceof RegExp ? test.exec.bind(test) : _.eq(test) );
		
	return ss.combine( [sig], function( values, src, idx ) {
		if ( !src || !test(values[0]) ) return neant;
		return values[0];
	});
};

ss.def = function def( start, reactions /*, ... */ ) {
	var current = start,
		sources = _.slice( arguments, 1),
		handlers = _.map(sources, function(s) {
			return _.fn(s[1]);
		}),
		sigs =  _.map(sources, function(s) {
			return s[0];
		});

	var res = ss.combine( sigs, function( values, src, idx ) {
		return !src ?	start :  
						( current = handlers[idx](values[idx], current) )
	});
	res.name('def('+start+', ' + _.map(sigs, _.propGetter('$$name')) + ')' );
	return res;
};

ss.bState = function bstate(start, evOn, evOff) {
	if(arguments.length < 3) {
		var counter = evOn.counter();
		evOn = counter.filter(function(v) { 
			return v % 2; 
		});
		evOff = counter.filter(function(v) { 
			return !(v % 2);
		});
	}
	return ss.def( start, 
	    [evOn, true],
	    [evOff, false]
    );
};

ss.and = ss.lift(_.and);
ss.or  = ss.lift(_.or);
ss.if = ss.lift(_.if);

Signal.prototype.until = function (event) {
	if(this.$$discrete)  throw Error('Until must be called on a conitnuous signal');
	var curSrc = this,
		sig = new Signal(this.$$currentValue),
		emit = sig.$$emit.bind(sig);
	
	curSrc.on(emit);
	event.on(setSig);
	return sig;
	
	function setSig(src) {
		src = ss.makeSig(src);
		if(src.$$discrete)
			throw Error('Until must swtich to a conitnuous signal');
		curSrc.off(emit);
		curSrc = src;
		curSrc.on(emit);
		event.off(setSig);
		sig.$$currentValue = curSrc.$$currentValue;
		sig.$$emit(sig.$$currentValue);
	}
}

Signal.prototype.switch = function(ev) {
	var curSrc,
		sig = new Signal(this.$$currentValue),
		emit = sig.$$emit.bind(sig);
	
	ev.tap(setSig);
	setSig(this, true);
	return sig;
	
	function setSig(src, isStart) {
		curSrc && curSrc.tapOff(emit);
		curSrc = ss.makeSig(src).tap(emit);
		!isStart && emit(src.$$currentValue);	
	}
}

Signal.prototype.map = function() {
	return ss.map( this, _.pluck.apply( null, _.slice(arguments) ) ).name(this.$$name+".map(fn)");
};

Signal.prototype.val = function (val) {
	return ss.map( this, _.val(val) ).name(this.$$name+'.val('+val+')');
};

Signal.prototype.fold = function(start, fn) {
	return ss.def( start, [this, fn] ).name(this.$$name+'.fold('+start+', fn)');
};

Signal.prototype.fold0 = function(fn) {
	return this.fold( this.$$currentValue, fn );
};

Signal.prototype.filter = function (test) {
	return ss.filter( this, test ).name(this.$$name+'.filter()');
};

Signal.prototype.not = function() {
	return ss.map(this, function(v) { return !v }).name(this.$$name+'.not()');
};

Signal.prototype.and = function() {
	return ss.and.apply(null, [this].concat(_.slice(arguments)));
};

Signal.prototype.merge = function() {
	return ss.merge.apply(null, [this].concat(_.slice(arguments)));
};

Signal.prototype.counter = function() {
	return this.fold(0, function(val, prev) {
		return prev + 1;
	});
}

Signal.prototype.keep = function(start) {
	return ss.def(start, [this, _.id]);
}

_.each( ['eq', 'notEq', 'gt', 'gte', 'lt', 'lte'], function( key ) {
	var fpred = _[key],
		pred = function(me, other) { return fpred(other)(me) };
	Signal.prototype[key] = function(sig) {
		sig = ss.makeSig(sig);
	    return ss.map( this, sig, pred);
	};
	
	var whenKey = 'when'+key.charAt(0).toUpperCase() + key.slice(1);
	Signal.prototype[whenKey] = function(sig) {
		sig = ss.makeSig(sig);
	    return this[key](sig).filter(_.isTrue);
	};
});

Signal.prototype.printDeps = function(level) {
	level = level || 0;
	console.log( indent(level) + this.$$name );
	_.each( this.$$deps, function(s) {
		s.printDeps(level+1);
	});
}

Signal.prototype.printGraph = function printGraph(level) {
	level = level || 0;
	console.log( indent(level) + this.$$name );
	_.each( sig.$$sources, function(s) {
		s.printGraph(level+1)
	});

	
};

function indent(lev) {
	var s = ''
	while( (lev--) > 0) {
		s += '....';
	}
	return s;
}


module.exports = ss;