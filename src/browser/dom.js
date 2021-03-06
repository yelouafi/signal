var _ = require('../static.js');
var ss = require('../reactive.js'),
	signal = ss.signal;

 var raf = window.requestAnimationFrame
    	|| window.webkitRequestAnimationFrame
    	|| window.mozRequestAnimationFrame
    	|| window.msRequestAnimationFrame
    	|| function(cb) { return window.setTimeout(cb, 0); };

var jobQueue = [];
function runQueue() {
	//console.log('running dom update queue; jobs: ', jobQueue.length);
	try {
		_.each(jobQueue, function(job) {
			job();
		});	
	} finally {
		jobQueue = [];
	}
}
function doLater(job) {
	if( !jobQueue.length ) {
		raf(runQueue);
	}
	jobQueue.push(job);
}

var elcache = {}, uuid = 0;
function elm(el, src) {
	el =	_.isStr(el) ? document.querySelector(el) : el;
	var ret = 	el instanceof Relm ? el : elcache[el.dataset.uid] || newEl(el);
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
			var prev = this.el[prop];
			if(prev !== val)
				this.el[prop] = val;
			return this;
		}
	}
}

function makeSlot(getter, setter) {
	function slot(val) {
		if(arguments.length  < 1)
			return getter.call(this);
		setter.call(this, val);
		return this;
	}
	slot.getter = getter;
	slot.setter = setter;
	return slot;
}

function Relm(el) {
	this.el = el;
	this.on = eventDelegate(this.el);
	this.$$signals = {};
	this.$$children = [];
	this.$$slots = {};
}

Relm.prototype.toString = function () {
	var el = this.el;
	return el.nodeName.toLowerCase() + (el.id ? '#' + el.id : '') + '.' + el.className;
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

Relm.$$slots = {};
Relm.prototype.prop = function(prop) {
	var me = this;
	return this.$$slots[prop] || (this.$$slots[prop] = bindSlot(prop));
	
	function bindSlot(p) {
		return (Relm.$$slots[p] || makeSlot( elmProp(p) )).bind(me);
	}
}

Relm.prototype.getter = function(prop) {
	var pf = this.prop(prop);
	return function() {
		return pf();
	}
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
			ss.makeSig(val).tap(function(v) {
				doLater(function() {
					//console.log(me.toString() + ': setting '+key+' to '+v)
					prop(v);
				});
			});
		}
	});
	return this;
}


Relm.defineProp = function(name, fn) {
	var conf = _.fn(fn)();
	return Relm.$$slots[name] = Relm.prototype[name] = makeSlot(conf.getter, conf.setter);
}

Relm.propAlias = function(alias, domProp) {
	Relm.defineProp(alias, elmProp(domProp));
}

Relm.propAlias('value', 'value');
Relm.propAlias('text', 'textContent');
Relm.propAlias('html', 'innerHTML');
Relm.propAlias('checked', 'checked');
Relm.propAlias('disabled', 'disabled');
Relm.propAlias('readOnly', 'readOnly');

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
	this.$$css = 	_.isObj(val)	? _.filter( Object.keys(val), isTrue) :
				_.isStr(val)	? val.match(/\S+/g) :
				_.isArray(val)	? val :
				/* otherwise 	*/[];
	_.each( this.$$css, classList.add.bind(classList) );
	
	function isTrue(key) {
		var kval = val[key];
		return kval && kval !== ss.neant; 
	}
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
	var el = this.el;
	setTimeout(function() {
		v ? el.focus() : el.blur();
	}, 0);
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
	if(!event) {
		event = selector;
		selector = null;
	}
	var me = this, sig = this.$$signals[event];
	if( !sig ) {
		var events = _.isArray(event) ? event : event.trim().split(/\s+/g);
		sig = ss.signal();
		_.each(events, function(ev) {
			me.on( selector, ev, sig.$$emit.bind(sig) ); 
		});
		sig.name((selector ? selector + ':' : '') + event);
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
			return ss.def( getter(), [this.signal( null, event || defaultEvent ), getter] ).name(this.toString() + ':' + name);  
		} 
	});
	
Relm.prototype.$keyChar = function (ch) {
	var sig = this.$keypress().map(function(e) { 
		return String.fromCharCode(e.keyCode)
	});
	return arguments.length ? sig.filter(ch) : sig;
};

Relm.prototype.$keyCode = function (code) { 
	var sig = this.$keydown().map('.keyCode');
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

function ArrayChange(type, data) {
	this.type = type;
	this.data = data;
}
_.each(['add', 'remove', 'update', 'insert', 'reposition'], function(entry) {
   ArrayChange[entry] = entry;
});


function Map() {
	this.keys = [],
	this.vals = [];
}

Map.prototype.set = function (key, val) {
	this.keys.push(key);
	this.vals.push(val);
	return val;
}
Map.prototype.get = function (key) {
	var idx = this.keys.indexOf(key);
	return idx >= 0 ? this.vals[idx] : undefined;
}

function tmap(tfn, src) {
	var cache = new Map();
	return src.map(sync);

	function sync(arr) {
		return _.map( arr, function(obj) {
			return cache.get(obj) || cache.set(obj, tfn(obj) );
		});	
	}
}

elm.tmap = tmap;
window.$window = new Relm(window);
window.$document = new Relm(document);

module.exports = {
	$: elm,
	$$: allElms
}