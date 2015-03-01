(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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
_.inc 			= function(v) { return v+1 }
_.or 			= function() { return _.any( arguments, _.id ); }
_.and 			= function() { return _.first( arguments, _.not ) === -1 }
_.noop			= function noop() {}
_.id			= function(val) { return val; }
_.val			= function(val) {  return function() { return val; } }
_.truthy		= _.val(true);
_.falsy			= _.val(false); 

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
_.applyEach		= function(fns, target) { return ( _.isObj(fns) ? _.mapObj : _.map )( fns, _.callw(target) ); }
_.getProp		= function(path, obj) { return _.pipe( _.map( path, _.propGetter ), _.isObj )(obj); }
_.method		= function(obj, meth) { return obj[meth].bind(obj); };

_.ffold = function( state, fn ) {
	return function(value) { 
		return ( state = fn( state, value ) ); 
	};
}

/*
ftemplate(fn, args...) 										-> fn(args..., v)
ftemplate('.*.prop') 										-> v[*]['prop']
ftemplate('.*.meth(), args...') 							-> v[*]['meth'](args...)
ftemplate(['.*.prop1, '.*.meth()'], args...) 				-> [ v[*]['prop'], v[*]['meth'](args...) ]
ftemplate({prop1: '.*.prop', prop2: '.*.meth()'}, args...)	-> { prop1: v[*]['prop'], prop2: v[*]['meth'](args...) }
*/
_.fapply = function( config, args /*...*/ ) {
	args = _.slice(arguments, 2);
	var tpl = makeGetter(config);
	if( _.isArray(tpl) || _.isObj(tpl) )
		return _.bindl( _.applyEach, tpl );
	else
		return tpl;
	
	function scalar(val) {
		var methn;
		if( _.isStr(val) && ( (prefix = val[0]) === '.' ) ) {
			var path = _.slice( val.split('.'), 1 ),
				head = _.head(path),
				hasMethod = head.length > 2 && head.indexOf('()') === (head.length - 2),
				fprop = _.bindl( _.getProp, path );
			if(!hasMethod) 
				return fprop;
			else 
				return function(v) {
					args = _.map( args, function(v) { return _.isFn(v) ? v() : v; } )
					return fprop.apply( null, v, args );
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
},{}],2:[function(require,module,exports){
var _ = require('../base.js');
var ss = require('../signal.js'),
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
},{"../base.js":1,"../signal.js":6}],3:[function(require,module,exports){
var _ = require('../base.js');
var ss = require('../signal.js'),
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
	var docf = document.createDocumentFragment();
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
ss.$ = elm;
ss.$$ = allElms;
},{"../base.js":1,"../signal.js":6}],4:[function(require,module,exports){


window.ss = require('../signal.js');
window.ss._ = require('../base.js');
},{"../base.js":1,"../signal.js":6}],5:[function(require,module,exports){
var _ = require("./base.js");

function Event() { 
	this.slots = [];
}

Event.prototype.on = function(slot) {
    _.add(this.slots, slot, true); 
};

Event.prototype.off = function(slot) { 
    _.remove(this.slots, slot); 
};

Event.prototype.emit = function (data) { 
	_.each( 
	    this.slots, 
	    _.callw( data )
    ); 
};

module.exports = Event;
},{"./base.js":1}],6:[function(require,module,exports){
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

ss.makeSig = function(s) {	
	return ss.isSig( s ) ? s : signal(s);
}

ss.collect = function collect( sources, cb ) {
	var res = {};
	res.sources = _.map( sources, ss.makeSig);
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
	function connect(src, idx) 		{ src.on( res.handlers[idx] ); }
	function disconnect(src, idx) 	{ src.off( res.handlers[idx] ); }
};

ss.combine = function combine( sources, fn, discr ) {
	sources = _.map( sources, function(s) { return _.isObj(s) ? combineObj(s) : ( _.isArray(s) ? ss.combineArr(s) : s); });
	var collection = ss.collect( sources, handle );
	var sig = signal( !discr ? fn( collection.startValues, null, -1 ) : neant );
	
	sig.$$log = collection.log;
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
Function.prototype.lift = function() {
	return ss.lift(this);
}

ss.filter = function filter() {
	var args = _.isArray( arguments[0] ) ? arguments[0] : _.slice( arguments ),
		test = args.pop();
	test = _.fn( test, _.eq(test) );
		
	return ss.combine( args, function( values, src, __ ) {
		if ( _.any(values, neant) ) return neant;
		var res = test.apply(null, values);
		return res || neant;
	}).occ;
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

ss.dcombine = function dmap(dynArrSig, fn) {
    var emitter = signal(),
		curSrc = null,
		combinedSrc = null,
		higherSrc = ss.map(dynArrSig, setSrc);
		
    return emitter;
    
    function setSrc( src ) {
		curSrc && curSrc.deactivate();
		combinedSrc && combinedSrc.deactivate();
		combinedSrc = fn(src);
		emitter.$$sources = combinedSrc.$$sources;
		combinedSrc.$$name = emitter.$$name;
		curSrc = ss.map( combinedSrc, emitter.$$emit.bind(emitter) );
		if( curSrc() !== neant )
			emitter.$$emit( curSrc() );
	}
};

ss.dmap = function dmap(dynArrSig, fn) {
	return ss.dcombine(dynArrSig, function (sigList) {
		return ss.map(sigList, fn);
	})
}

ss.dmerge = function dmerge(dynArrSig) {
	return ss.dcombine(dynArrSig, function (sigList) {
		return ss.merge(sigList);
	})
}

ss.flatMap = function flatMap(src, fn) {
	var arr = [];
	var dynSrc = ss.def(arr,
		[src, function(val) {
			arr.push( fn(val) );
			return arr;
		}]
	);
    return ss.dcombine(dynSrc, function (arrOfsig) {
    	return ss.merge(arrOfsig);
    });
};

ss.switch = function sswitch( startSig, event ) {
    startSig = ss.isSig(startSig) ? startSig : signal(startSig);
    var dynSrc = ss.def(startSig, [event, _.id]);
    return ss.dcombine(dynSrc, _.id);
};


ss.computed = function computed(fn) {
	var curSrc,
		emitter = ss.signal( invoke() );
	return emitter;
	
	function invoke() {
		curSrc && curSrc.deactivate();
		var res = DepsTracker.invoke(fn);
		curSrc = ss.combine( res.deps, invoke, true );
		emitter && emitter.$$emit(res.result);
		return res.result;
	}
};

var DepsTracker = {};
DepsTracker.stack	= [];
DepsTracker.invoke = function(fn) {
	DepsTracker.stack.push([]);
	var res = fn();
	return { deps: DepsTracker.stack.pop(), result: res };
}
DepsTracker.tracking	= function() 	{ return DepsTracker.stack.length; };
DepsTracker.addDep		= function(dep) { 
	return _.add( _.head(DepsTracker.stack), dep, true );
}

ss.timer = function timer ( prec, stop ) {
	var sig = signal( Date.now() ),
		iv = start(),
		count = 0;
		
	if( ss.isSig(stop) )
		stop.on( stopTimer );
		
	return sig;

	function start() { 
	    return setInterval( emit, prec );
	}
	
	function emit() { 
		sig.$$emit( count );
		if ( stop && isFinite(stop) && (++count) >= stop ) 
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

ss.fromArray = function signalFromArray(array, interval) {
	return interval ? withInterval() : withoutInterval();

	function withInterval() {
		return ss.timer(interval, array.length).map(_.objGetter(array));
	}
	
	function withoutInterval() {
		var sig = signal();
		setTimeout(function() {
			_.each(array, sig.$$emit.bind(sig));
		}, 0);
		return sig;
	}
}

function signal() {
	var startValue = arguments.length ? arguments[0] : neant,
		discrete = ( startValue === neant ),
		currentValue = startValue,
		valueEvent = new Event(),
		log = null;
	
	sigval.$$name = currentValue !== neant ? currentValue : 'anonym';
	sigval.$$sig = true;
	sigval.$$sources = [];
	sigval.$$deps = [];
	
	sigval.sname = function(name) { 
		sigval.$$name = name;
		return sigval; 
	}
	
	sigval.log = function(name) {
		if(name) sigval.$$name = name;
		log = _.logger(sigval.$$name); 
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
		var fpred = _[key],
			pred = function(me, other) { return fpred(me)(other) };
		sigval[key] = function(sig) {
			sig = ss.makeSig(sig);
		    return ss.map( sigval, sig, pred);
		};
		
		var whenKey = 'when'+key.charAt(0).toUpperCase() + key.slice(1);
		sigval[whenKey] = function(sig) {
			sig = ss.makeSig(sig);
		    return ss.filter( sigval, sig, pred);
		};
	});
	
	sigval.not = function() {
		return ss.map(sigval, function(v) { return !v });
	}
	
	sigval.and = _.bindl( ss.and, sigval );
	
	sigval.merge = _.bindl( ss.merge, sigval );
	
	sigval.counter = _.bindl( ss.fold, sigval, 0, _.inc );
	
	sigval.occ = discrete ? sigval : ss.merge( sigval );
	
	sigval.keep = function(start) {
		return ss.def(start, [sigval, _.id]);
	}
	
	sigval.tap = function(proc) {
		return ss.map(sigval, function(v) {
			proc(v);
			return v;
		})
	}
	
	sigval.printDeps = function(level) {
		level = level || 0;
		console.log( indent(level) + sigval.$$name );
		_.each( sigval.$$deps, function(s) {
			s.printDeps(level+1);
		});
	}
	
	function sigval() { 
		if( DepsTracker.tracking() ) 
			DepsTracker.addDep( sigval );
		return currentValue;
	}
	
	return sigval;
}

ss.printGraph = function printGraph( sig, level ) {
	level = level || 0;
	console.log( indent(level) + sig.$$name );
	_.each( sig.$$sources, function(s) {
		printGraph( s, level+1 )
	});

	
}

function indent(lev) {
	var s = ''
	while( (lev--) > 0) {
		s += '....';
	}
	return s;
}

module.exports = ss;
},{"./base.js":1,"./event.js":5}]},{},[2,3,4]);
