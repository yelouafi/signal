(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var _ = require('../static.js');
var ss = require('../reactive.js'),
	signal = ss.signal;


function queryString(obj) {
	var res = [];
	_.eachKey( obj, function(val, key) {
		res.push( encodeURIComponent(key) + '=' + encodeURIComponent(val) );
	} )
	return res.join('&');
}

function ajaxSig( req ) {
	var xhr = new XMLHttpRequest(), sig = signal();
	
	if(req.headers)
		_.eachKey( req.headers, function(val, key) {
			xhr.setRequestHeader(key, val);
		});
	req = _.isStr(req) ? { method: 'GET', url: req } : req;
	req.method = (req.method || 'GET').toUpperCase();
	req.url = req.url + (req.data && req.method === 'GET' ? '?'+queryString(req.data)  : "");
	xhr.onreadystatechange = handler;
	xhr.open( req.method, req.url );
	xhr.send();
	
	return sig;
	
	function handler() {
		if (xhr.readyState === 4) {
			sig.$$emit(xhr);
		}
	}
}

ss.ajax = ajaxSig;
},{"../reactive.js":5,"../static.js":7}],2:[function(require,module,exports){
var _ = require('../static.js');
var ss = require('../reactive.js'),
	signal = ss.signal;


var elcache = {}, uuid = 0;

function elm(el, src) {
	el =	_.isStr(el) ? document.querySelector(el) : el;
	var ret = el instanceof Relm ? el : elcache[el.dataset.uid] || newEl(el);
	if(src && _.isObj(src))
		ret.config(src);
	return ret;
	
	function newEl(domEl) {
		el.dataset.uid = (++uuid);
		return elcache[uuid] =  new Relm(el);
	}
}

function allElms(selector, fnConf) {
	var all = _.isStr(selector) ? document.querySelectorAll(selector) : selector;
	return _.map( all, function(el) {
		var ee = elm(el);
		if(fnConf && _.isFn(fnConf))
			fnConf.call(ee);
		return ee;
	} );
}

function eventDelegate( root ) {
	var eventRegistry = {};
	root = root || document;
	
	function dispatchEvent( event ) {
		var target = event.target;
		_.each( eventRegistry[event.type], function ( entry ) {
			if( target.matches( entry.selector ) )
				entry.handler.call(target, event);
		});
	}
	function removeHandlerFn(event, idx) {
		return function() {
			var handlers = eventRegistry[event];
			return function() { handlers.splice(idx, 1) };
		}
	}
	return function (selector, event, handler) {
		if(!selector) {
			root.addEventListener(event, handler, true);
			return function() {
				root.removeEventListener(event, handler);
			}
		}
		var handlers = eventRegistry[event];
		if ( !handlers ) {
			handlers = eventRegistry[event] = [];
			root.addEventListener(event, dispatchEvent, true);
		}
		handlers.push({
			selector: selector,
			handler: handler
		});
		return removeHandlerFn(event, handlers.length - 1);
	};
}

function elmProp(prop) {
	return {
		getter: function() { 
			return this.el[prop];
		},
		setter: function(val) {
			this.el[prop] = val;
			return this;
		}
	}
}

function propFn(getter, setter) {
	return function(val) {
		if(arguments.length  < 1)
			return getter.call(this);
		setter.call(this, val);
		return this;
	}
}

function Relm(el) {
	this.el = el;
	this.on = eventDelegate(this.el);
	this.$$signals = {};
	this.$$children = [];
	this.$$eprops = {};
}

Relm.prototype.matches = function (selector) {
	return this.el.matches(selector);
}

Relm.prototype.$ = function(selector, src) {
	return elm(this.el.querySelector(selector), src);
}

Relm.prototype.$$ = function(selector, fnConf) {
	return allElms(this.el.querySelectorAll(selector), fnConf);
}

Relm.prototype.data = function(key) {
	return this.el.dataset[key];
}

Relm.prototype.prop = function(prop) {
	var slot = this[prop];
	return slot ? slot.bind(this) : (
		this.$$eprops[prop] || ( this.$$eprops[prop] = propFn(elmProp(prop)).bind(this) )
	);
}

Relm.prototype.getter = function(prop) {
	return function() {
		return this.prop(prop)();
	}.bind(this);
}

Relm.prototype.config = function(conf) {
	var me = this;
	_.eachKey(conf, function(val, key) {
		if( key[0] === '>' ) {
			_.each( me.$$(key.slice(1)), function(elm) { elm.config(val); });
		} else if( key[0] === '$' ) {
			me.domSignal(key, val);	
		} else {
			var prop = me.prop(key);
			prop && ss.map(val, prop);
		}
	});
	return this;
}



Relm.defineProp = function(name, fn) {
	var conf = _.fn(fn)();
	return Relm.prototype[name] = propFn(conf.getter, conf.setter);
}

Relm.propAlias = function(alias, domProp) {
	Relm.defineProp(alias, elmProp(domProp));
}

Relm.simpleProp = function (name, setter) {
	var priv = '@@'+name;
	Relm.defineProp(name, {
		getter: function() { 
			return this[priv];
		},
		setter: function(val) {
			setter.call(this, val);
			this[priv] = val;
		}
	});
}

Relm.propAlias('value', 'value');
Relm.propAlias('text', 'textContent');
Relm.propAlias('html', 'innerHTML');
Relm.propAlias('checked', 'checked');
Relm.propAlias('disabled', 'disabled');
Relm.propAlias('readOnly', 'readOnly');

Relm.simpleProp('visible', function(v) {
		!v ? this.el.style.display = 'none' : 
			this.el.style.removeProperty('display'); 
});

Relm.simpleProp('enabled', function(v) {
	this.el.disabled = !v;
});

Relm.simpleProp('css', function( val ) {
	var classList = this.el.classList;
	this.$$css && _.each( this.$$css, classList.remove.bind(classList) );
	this.$$css = 	_.isObj(val)	? _.filter( Object.keys(val), _.objGetter(val) ) :
				_.isStr(val)	? val.match(/\S+/g) :
				_.isArray(val)	? val :
				/* otherwise 	*/[];
	_.each( this.$$css, classList.add.bind(classList) );
})

Relm.simpleProp('style', function(st) {
	var style = this.el.style;
	this.$$style && _.each( st, style.removeProperty.bind(style) );
	this.$$style = Object.keys(st);
	_.each( this.$$style, function(key) { 
		style[key] = st[key]; 
	});
});

Relm.simpleProp('attr', function(v) {
	var el = this.el;
	this.$$attrs && _.each( this.$$attrs, el.removeAttribute.bind(el) );
	this.$$attrs = Object.keys(v);
	_.each( this.$$attrs, function(key) { 
		el.setAttribute(key, v[key]);
	});
});

Relm.simpleProp('focus', function(v) {
	v ? this.el.focus() : this.el.blur();
});

Relm.defineProp('children', function() {
	var docf /*= document.createDocumentFragment()*/;
	return {
		getter: function() { return this.$$children || []; },
		setter: function(elms) {
			var el = this.el;
			while (el.firstChild) el.removeChild(el.firstChild);
			if(elms && elms.length) {
				_.each( elms, function(ch) { 
					docf.appendChild(ch.el); 
				});
				el.appendChild(docf);	
			}
			this.$$children = elms;
		}
	}
});

Relm.prototype.append = function(elm) {
	this.el.appendChild(elm.el);
	this.$$children.push(elm);
	elm.parent = this;
}
Relm.prototype.remove = function(elm) {
	this.el.removeChild(elm.el);
	_.remove(this.$$children, elm);
	elm.parent = undefined;
}

Relm.prototype.signal = function ( selector/* opt */, event ) {
	var me = this, sig = this.$$signals[event];
	if( !sig ) {
		var events = _.isArray(event) ? event : event.trim().split(/\s+/g);
		sig = ss.signal();
		_.each(events, function(ev) {
			me.on( selector, ev, sig.$$emit.bind(sig) ); 
		});
		this.$$signals[event] = sig;
	}
	return sig;
}

Relm.prototype.domSignal = function (name, sig) {
	var me = this;
	sig.on( function (v) {
		var evt = document.createEvent("CustomEvent");
		evt.initCustomEvent( name, true, false, { data: v, target: me });
		me.el.dispatchEvent(evt);
	});
}

_.each(	['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout', 'dragstart', 'drag', 'dragenter', 
		'dragleave', 'dragover', 'drop', 'dragend', 'keydown', 'keypress', 'keyup', 'select', 'input', 'change', 'submit', 'reset', 'focus', 'blur'], 
	function(event) {  
		Relm.prototype['$'+event] = function (selector) { 
			return this.signal( selector, event ); 
		};
	});

_.each(	[	['value'		,'change'	,'value'], 
			['checked'	,'change'	,'checked']
		], 
	function( opt ) {
		var name = opt[0], defaultEvent = opt[1], prop = opt[2];
		Relm.prototype['$'+name] = function( event ) {
			var getter = this.getter(prop);
			return ss.def( getter(), [this.signal( null, event || defaultEvent ), getter] );  
		} 
	});
	
Relm.prototype.$keyChar = function (ch) {
	var sig = this.$keypress().map(function(e) { 
		return String.fromCharCode(e.keyCode)
	});
	return arguments.length ? sig.filter(ch) : sig;
};

Relm.prototype.$keyCode = function (code) { 
	var sig = this.$keypress().map('.keyCode');
	return arguments.length ? sig.filter(code) : sig;
};

var tpls = {};
Relm.prototype.template = function(selector) {
	var tel = tpls[selector] || ( tpls[selector] = pullTemplate(this.el, selector) );
	return tel && create;
	
	function create() {
		return elm(tel.cloneNode(true));
	}
	
	function pullTemplate(el, selector) {
		var tel = el.querySelector(selector);
		if(tel) {
			tel.parentElement.removeChild(tel);
			tel.classList.remove('template');
			tel.removeAttribute('id');
			return (tpls[selector] = tel);
		} else
			throw 'Unable to find template "' + selector + '"!!';
	}
}

function tmap(tfn, src, trackByProp) {
	var cache = {};
	var getKey = trackByProp ? _.propGetter(trackByProp) : JSON.stringify;
	return src.map(sync);
	
	function sync(arr) {
		return _.map( arr, function(obj) {
			var key = getKey(obj);
			return cache[key] || (cache[key] = tfn(obj));
		});	
	}
}

elm.tmap = tmap;

module.exports = {
	$: elm,
	$$: allElms
}
},{"../reactive.js":5,"../static.js":7}],3:[function(require,module,exports){


window.ss = require('../reactive.js');
window.ss._ = require('../static.js');
},{"../reactive.js":5,"../static.js":7}],4:[function(require,module,exports){
function Neant() {};

Neant.prototype.toString = function() {
    return 'Neant';
}

module.exports = new Neant() ;
},{}],5:[function(require,module,exports){
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

ss.makeSig = function(s) {	
	return isSig( s ) ? s : signal(s);
}

ss.collect = function collect( sources, cb ) {
	var res = {};
	res.sources = _.map( sources, ss.makeSig);
	res.startValues = _.map( res.sources, _.propGetter('$$currentValue'), sample );
	res.handlers = _.map( res.sources, handler );
	res.log = '[' + _.map( res.sources, function(s) { return s.$$log }).join(', ') + ']';	
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
	sig.name(collection.log);
	
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
	test = _.fn( test, _.eq(test) );
		
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

	return ss.combine( sigs, function( values, src, idx ) {
		return !src ?	start :  
						( current = handlers[idx](values[idx], current) )
	});
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


Signal.prototype.map = function() {
	return ss.map( this, _.template.apply( null, _.slice(arguments) ) )
};

Signal.prototype.val = function (val) {
	return ss.map( this, _.val(val) );
};

Signal.prototype.fold = function(start, fn) {
	return ss.def( start, [this, fn] );
};

Signal.prototype.fold0 = function(fn) {
	return this.fold( this.$$currentValue, fn );
};

Signal.prototype.filter = function (test) {
	return ss.filter( this, test );
};

Signal.prototype.not = function() {
	return ss.map(this, function(v) { return !v });
};

Signal.prototype.and = function() {
	return ss.and.call(null, _.slice(arguments));
};

Signal.prototype.merge = function() {
	return ss.merge.call(null, _.slice(arguments));
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
		pred = function(me, other) { return fpred(me)(other) };
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



Signal.prototype.tap = function(proc) {
	return ss.map(this, function(v) {
		proc(v);
		return v;
	})
}

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
},{"./neant.js":4,"./signal.js":6,"./static.js":7}],6:[function(require,module,exports){
var _ = require("./static.js"),
	neant = require('./neant.js');


function EventHelper() { 
	this.slots = [];
}

EventHelper.prototype.on = function(slot) {
    _.add(this.slots, slot, true); 
};

EventHelper.prototype.off = function(slot) { 
    _.remove(this.slots, slot); 
};

EventHelper.prototype.emit = function (data) { 
	_.each( 
	    this.slots, 
	    _.callw( data )
    ); 
};


function log(prefix, val) {
    console.log(prefix + ':' + val);
}

function Signal() {
    this.$$currentValue = arguments.length ? arguments[0] : neant,
	this.$$discrete = ( this.currentValue === neant ),
	this.$$valueEvent = new EventHelper(),
	this.$$log = false;
	this.$$name = 'anonym';
	this.$$sources = [];
	this.$$deps = [];
}



Signal.prototype.name = function(name) {
    this.$$name = name;
    return this;
}

Signal.prototype.log = function(log) {
    this.$$log = arguments.length ? log : true;
    return this;
}

Signal.prototype.$$emit = function(val) {
	if(this.$$log)
		log(this.$$name, val);
	if( !this.$$discrete )
		this.$$currentValue = val;
	this.$$valueEvent.emit(val);
}

Signal.prototype.on = function(listener) {
    this.$$valueEvent.on(listener);
}

Signal.prototype.off = function(listener) {
    this.$$valueEvent.off(listener);
}

Signal.prototype.activate = Signal.prototype.deactivate = function() {}

module.exports = Signal;
},{"./neant.js":4,"./static.js":7}],7:[function(require,module,exports){


var _ = {};
var valueObjs		= ['string', 'boolean', 'number', Date];

_.slice 		= function( arr, begin, end) { return Array.prototype.slice.call( arr, begin, end ); };
_.logger 		= function (prefix) { return function(msg) { console.log( prefix, msg ); } };

_.isValue		= function(v) { return v === null || v === undefined || v instanceof String || v instanceof Number || v instanceof Boolean || v instanceof Date  };
_.isStr			= function(arg) { return (typeof arg === 'string'); };
_.isArray		= Array.isArray;
_.isObj			= function(arg) { return (typeof arg === 'object') && !_.isValue(arg); };
_.isFn 			= function(arg) { return (typeof arg === 'function') ; };

_.eq			= function(pred) { return function(arg) { return pred === arg; }; };
_.notEq			= function(pred) { return function(arg) { return pred !== arg; }; };
_.gt			= function(pred) { return function(arg) { return pred < arg; }; };
_.gte			= function(pred) { return function(arg) { return pred <= arg; }; };
_.lt 			= function(pred) { return function(arg) { return pred > arg; }; };
_.lte			= function(pred) { return function(arg) { return pred >= arg; }; };

_.fnot 			= function(fpred) { return function() { return !fpred.apply(null, arguments); } }
_.noop			= function noop() {}
_.id			= function(val) { return val; }
_.val			= function(val) {  return function() { return val; } }
_.truthy		= _.val(true);
_.falsy			= _.val(false); 
_.isFalse 		= function(v) { return !v };
_.isTrue 		= _.id;

_.inc 			= function(v) { return v+1 };
_.or 			= function() { return _.any(arguments, _.isTrue); };
_.and 			= function() { return _.all(arguments, _.isTrue); };
_.if 			= function(cond, then, elze) { return cond ? then : elze; };

_.fn			= function(arg, alt) { return _.isFn( arg ) ? arg : (alt || _.val(arg)); };
_.callw		= function() { 
	var bargs = _.slice(arguments);
	return function( fn ) {
		return fn.apply( null, bargs );
	}
};

_.bind	= Function.prototype.bind;
_.bindl	= function(fn) { 
	return _.bind.apply( fn, [undefined].concat( _.slice(arguments, 1 )) ); 
};

_.bindr	= function(fn) {
	var bargs = _.slice( arguments, 1 );
	return function() { 
		return fn.apply( undefined, _.slice(arguments).concat(bargs) );
	} 
};

_.each = function(iter, cb, exit) {
	exit = _.fn( exit, _.falsy );
	for(var i = 0, l = iter.length; i < l; i++) {
		var val = iter[i];
		if( exit( val, i) ) return;
		cb( val, i );
	}
};

_.any = function(iter, test) {
	test = _.fn( test, _.eq(test) );
	for(var i = 0, l = iter.length; i < l; i++)
		if ( test(iter[i]) ) return true;
	return false;
};

_.all = function(iter, test) { 
	test = _.fn( test, _.eq(test) );
	for(var i = 0, l = iter.length; i < l; i++)
		if ( !test(iter[i]) ) return false;
	return true;
};

_.first = function(iter, test) {
	test = _.fn( test, _.eq(test) );
	for(var i = 0, l = iter.length; i < l; i++)
		if ( test(iter[i]) ) return i;
	return -1;
}

_.count = function(iter, test) {
	test = _.fn( test, _.eq(test) );
	var count = 0;
	for(var i = 0, l = iter.length; i < l; i++)
		if ( test(iter[i]) ) count++;
	return count;
}

_.map = function(iter, cb) {
	cb = _.fn(cb);
	var res = new Array( iter.length );
	for(var i = 0, l = iter.length; i < l; i++)
		res[i] = cb( iter[i], i );
	return res;
}
_.filter = function(iter, test) {
	test = _.fn( test, _.eq(test) );
	var res = [];
	for(var i = 0, l = iter.length; i < l; i++) {
		var val = iter[i];
		if( test(val) )
			res.push(val);
	}
	return res;
}
_.empty = function(arr) { return arr.length === 0; };
_.head = function(arr) { return arr[arr.length-1] };
_.tail = function(arr) { return arr.slice(1); }
_.pop = function(arr) { return arr.pop(); };

_.add = function(arr, el, noDup) {
	if( !noDup || arr.indexOf(el) < 0 )
		return arr.push(el);
};

_.removeAt = function(arr, idx) {
	if( idx >= 0)
		return arr.splice(idx, 1);
};

_.remove = function(arr, el) {
	_.removeAt(arr, arr.indexOf(el));
};

_.removeAll = function(arr, test) {
	test = _.fn( test, _.eq(test) );
	for(var i = arr.length-1; i >= 0; i--) {
		if( test(arr[i], i) )
			arr.splice(i, 1);
	}
};

_.sort = function(arr, comp) {
	var fncomp = comp && _.fn(comp, function(p1, p2) { 
			return	p1[comp] < p2[comp] ?	-1 :
					p1[comp] > p2[comp] ?	1 :
					/* equals 			*/	0;		
		});
	return arr.sort(fncomp);
};

_.eachKey = function(obj, cb) {
	var keys = Object.keys(obj);
	for(var i = 0, l = keys.length; i < l; i++) {
		var key = keys[i];
		cb( obj[key], key );
	}
}
_.mapObj = function(obj, cb) {
	cb = _.fn(cb);
	var res = {};
	_.eachKey( obj, function( val, key ) {
		if( _.isObj( val ) ) {
			res[key] = _.mapObj( val, cb );
		} else
			res[key] = cb( val, key );
	});
	return res;
}
_.filterObj = function(obj, cb) {
	cb = _.fn(cb);
	var res = {};
	_.eachKey( obj, function( val, key ) {
		if( _.isObj( val ) ) {
			res[key] = _.filterObj( val, cb );
		} else if( cb( val, key ) )
			res[key] = val;
	});
	return res;
}
_.merge = function() {
	var res = {};
	_.each( arguments, function(obj) {
		_.eachKey(obj, function(val, key) {
			res[key] = val;
		})
	} );
	return res;
}

_.pipe = function(fns, canContinue) {
	canContinue = canContinue || _.truthy;
	fns = _.map( fns, _.bindr( _.fn, _.id ) );
	return function(val) {
		var res = val;
		for(var i = 0, l = fns.length; i < l; i++) {
			res = fns[i](res);
			if( !canContinue(res, i) ) return res;
		}
		return res;
	}
}

_.propGetter	= function(prop) { return function(o) { return o[prop]; } }
_.objGetter		= function(obj) { return function(prop) { return obj[prop]; } }
_.applyEach		= function(fn, target) { return ( _.isObj(fn) ? _.mapObj : _.map )( fn, _.callw(target) ); }
_.getProp		= function(path, obj) { return _.pipe( _.map( path, _.propGetter ), _.isObj )(obj); }
_.method		= function(obj, meth) { return obj[meth].bind(obj); };

_.scanner = function( seed, fn ) {
	return function(value) { 
		return ( seed = fn( value, seed ) ); 
	};
}

/*
template(fn, args...) 										-> fn(args..., v)
template('.*.prop') 										-> v[*]['prop']
template('.*.meth(), args...') 							-> v[*]['meth'](args...)
template(['.*.prop1, '.*.meth()'], args...) 				-> [ v[*]['prop'], v[*]['meth'](args...) ]
template({prop1: '.*.prop', prop2: '.*.meth()'}, args...)	-> { prop1: v[*]['prop'], prop2: v[*]['meth'](args...) }
*/
_.template = function( config, args /*...*/ ) {
	args = _.slice(arguments, 1);
	var tpl = makeGetter(config);
	if( _.isArray(tpl) )
		return function(target) { return _.map(tpl, _.callw(target)); };
	if( _.isObj(tpl) )
		return function(target) { return _.mapObj(tpl, _.callw(target)); };
	else
		return tpl;
	
	function scalar(val) {
		var methn, prefix;
		if( _.isStr(val) && ( (prefix = val[0]) === '.' ) ) {
			var path = _.slice( val.split('.'), 1 ),
				head = _.head(path),
				hasMethod = head.length > 2 && head.indexOf('()') === (head.length - 2);
			if(!hasMethod) {
				return _.bindl( _.getProp, path);
			} else {
				path[path.length-1] = head.substr(0, head.length - 2);
				var fmeth = _.bindl( _.getProp, path);
				return function(target) {
					return fmeth(target).apply( target, args );
				} 
			}
		} else
			return _.fn(val);
	}
	
	function makeGetter( param ) {
		if( _.isArray(param) )
			return _.map( param, makeGetter );
		else if( _.isObj( param ) )
			return _.mapObj( param, makeGetter );
		else
			return scalar( param );
	}
}

module.exports = _;
},{}]},{},[1,2,3]);
