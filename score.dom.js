(function() {
var _ = ss_;
window.$ = elm;
window.$.t = template;
var elcache = {}, uuid = 0;
function elm(el, src) {
	el =	_.isStr(el) ? document.querySelector(el) : el;
	var ret = el instanceof Elem ? el : elcache[el.dataset.uid] || newEl(el);
	if(src && _.isObj(src))
		ret.config(src);
	return ret;
	
	function newEl(domEl) {
		el.dataset.uid = (++uuid);
		return elcache[uuid] =  new Elem(el);
	}
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
		getter: function() { return this.el[prop]; },
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

function Elem(el) {
	this.el = el;
	this.on = eventDelegate(this.el);
	this.$$signals = {};
	this.$$children = [];
	this.$$eprops = {};
}

Elem.prototype.matches = function (selector) {
	return this.el.matches(selector);
}

Elem.prototype.$ = function(selector) {
	return elm(this.el.querySelector(selector));
}

Elem.prototype.$$ = function(selector) {
	return _.map(this.el.querySelectorAll(selector), elm);
}

Elem.prototype.prop = function(prop) {
	var slot = this[prop];
	return slot ? slot.bind(this) : (
		this.$$eprops[prop] || ( this.$$eprops[prop] = propFn(elmProp(prop)).bind(this) )
	);
}

Elem.prototype.getter = function(prop) {
	return function() {
		return this.prop(prop)();
	}.bind(this);
}

Elem.prototype.config = function(conf) {
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



Elem.defineProp = function(name, fn) {
	var conf = _.fn(fn)();
	return Elem.prototype[name] = propFn(conf.getter, conf.setter);
}

Elem.propAlias = function(alias, domProp) {
	Elem.defineProp(alias, elmProp(domProp));
}

Elem.simpleProp = function (name, setter) {
	var priv = '@@'+name;
	Elem.defineProp(name, {
		getter: function() { 
			return this[priv];
		},
		setter: function(val) {
			setter.call(this, val);
			this[priv] = val;
		}
	});
}

Elem.propAlias('value', 'value');
Elem.propAlias('text', 'textContent');
Elem.propAlias('html', 'innerHTML');
Elem.propAlias('checked', 'checked');
Elem.propAlias('disabled', 'disabled');
Elem.propAlias('readOnly', 'readOnly');

Elem.simpleProp('visible', function(v) {
		v ? this.el.style.display = 'none' : 
			this.el.style.removeProperty('display'); 
});

Elem.simpleProp('css', function( val ) {
	var classList = this.el.classList;
	this.$$css && _.each( this.$$css, classList.remove.bind(classList) );
	this.$$css = 	_.isObj(val)	? _.filter( Object.keys(val), _.objGetter(val) ) :
				_.isStr(val)	? val.match(/\S+/g) :
				_.isArray(val)	? val :
				/* otherwise 	*/[];
	_.each( this.$$css, classList.add.bind(classList) );
})

Elem.simpleProp('style', function(st) {
	var style = this.el.style;
	this.$$style && _.each( st, style.removeProperty.bind(style) );
	this.$$style = Object.keys(st);
	_.each( this.$$style, function(key) { 
		style[key] = st[key]; 
	});
});

Elem.simpleProp('attr', function(v) {
	var el = this.el;
	this.$$attrs && _.each( this.$$attrs, el.removeAttribute.bind(el) );
	this.$$attrs = Object.keys(v);
	_.each( this.$$attrs, function(key) { el.setAttribute(key, v[key]); } );
});

Elem.simpleProp('focus', function(v) {
	v ? this.el.focus() : this.el.blur();
});

Elem.defineProp('children', function() {
	var docf = document.createDocumentFragment();
	return {
		getter: function() { return this.$$children || []; },
		setter: function(elms) {
			var el = this.el;
			while (el.firstChild) el.removeChild(el.firstChild);
			_.each( elms, function(ch) { docf.appendChild(ch.el); } );
			el.appendChild(docf);
			this.$$children = elms;
		}
	}
});

Elem.prototype.append = function(elm) {
	this.el.appendChild(elm.el);
	this.$$children.push(elm);
	elm.parent = this;
}
Elem.prototype.remove = function(elm) {
	this.el.removeChild(elm.el);
	_.remove(this.$$children, elm);
	elm.parent = undefined;
}

Elem.prototype.signal = function ( selector/* opt */, event ) {
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

Elem.prototype.domSignal = function (name, sig) {
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
		Elem.prototype['$'+event] = function (selector) { 
			return this.signal( selector, event ); 
		};
	});

_.each(	[	['value'		,'change'	,'value'], 
			['checked'	,'change'	,'checked']
		], 
	function( opt ) {
		var name = opt[0], defaultEvent = opt[1], prop = opt[2];
		Elem.prototype['$'+name] = function( event ) {
			var getter = this.getter(prop);
			return ss.def( getter(), [this.signal( null, event || defaultEvent ), getter] );  
		} 
	});

var tpls = {};
function template(id, fnConf) {
	var tel = tpls[id] || ( tpls[id] = pullTemplate(id) );
	fnConf = _.fn( fnConf );
	create.collect = _.bindl(collect, create);
	return tel && create;
	
	function create(data) {
		var ee = elm(tel.cloneNode(true));
		ee.config( fnConf.call(ee, data) );
		return ee;
	}
	
	function pullTemplate(id) {
		var tel = document.getElementById(id);
		if(tel) {
			tel.parentElement.removeChild(tel);
			tel.removeAttribute('template');
			tel.removeAttribute('id');
			return (tpls[id] = tel);
		}
	}
}

function collect(fn, src) {
	return src.map(sync);
	
	function sync(arr) {
		return _.map( arr, function(obj) {
			return obj.$$el || (obj.$$el = fn(obj));
		});	
	}
}


})()

