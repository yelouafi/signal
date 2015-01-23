(function() {

var ss = window.ss, _ = window.ss_;
window.$$ = sigel;
ss.domSig= domSig;
ss.domSlot = domSlot;

var indexOf = Array.prototype.indexOf;
function delegate( root ) {
	var eventRegistry = {};
	root = root || document;
	
	function dispatchEvent( event ) {
		var target = event.target;
		_.each( eventRegistry[event.type], function ( entry ) {
			if( target.matches( entry.selector ) )
				entry.handler.call(target, event);
		});
	}
	return function (selector, event, handler) {
		if ( !eventRegistry[event] ) {
			eventRegistry[event] = [];
			root.addEventListener(event, dispatchEvent, true);
		}
		eventRegistry[event].push({
			selector: selector,
			handler: handler
		});
	};
}

function nodeFromString(html, args) {
    var tmp = document.createElement('body');
    tmp.innerHTML = html;
    var node = tmp.removeChild( tmp.firstChild );
    tmp = null;
	return node;
}
	
function Sigel(el) {
	this.el = el;
	this.signals = {};
	this.liveSignals = {};
	this.slots = {};
	this.live = delegate(this.el);
}

var sigelCache = window.$sigcache = {}, uuid = 0;
window.$document = new Sigel(document);
function sigel(el) {
	if(el === document) return window.$document;
	el = el instanceof Element ? el : ( el.indexOf('<') === 0 ? nodeFromString(el) : document.getElementById(el) );
	var ret = sigelCache[el.dataset.segid];
	if( !ret ) {
		el.dataset.segid = ++uuid;
		ret = sigelCache[uuid] =  new Sigel(el);
	}
	return ret;
}

function domSig( sigName, event, getter, target, init ) {
	target = target instanceof EventTarget ? target : document.getElementById(target);
	var sel = sigel(target), sigkey = sigName+event;
	var sig = sel.signals[sigkey];
	if( !sig ) {
		var events = _.isArray(event) ? event : event.trim().split(/\s+/g);
		sig = ss.signal();
		_.each(events, function(ev) {
			target.addEventListener( ev, sig.$$emit.bind(sig) ); 
		});
		sel.signals[sigkey] = sig;
	}
	var fn = _.fapply( getter || _.id );
	return arguments.length > 4 ? ss.def( init, [sig, fn] ) : sig.map( fn );
}

function domLiveSig( sigName, delegate, selector, event, getter ) {
	var sigkey = sigName+selector+event;
	var sig = delegate.liveSignals[sigkey];
	if( !sig ) {
		var events = Array.isArray(event) ? event : event.trim().split(/\s+/g);
		sig = ss.signal();
		_.each(events, function(ev) {
			delegate.live( selector, ev, sig.$$emit.bind(sig) ); 
		});
		delegate.signals[sigkey] = sig;
	}
	var fn = _.fapply( getter );
	return sig.map( fn );
}

function domSlot( slotName, setter, target, src ) {
	target = target instanceof EventTarget ? target : document.getElementById(target);
	var sel = sigel(target);
	var ssl = sel.slots[slotName];
	if( !ssl ) {
		setter = _.isStr(setter) ? setProp.bind( target, setter ) : _.fn( setter ).bind( target );
		ssl = sel.slots[slotName] = ss.slot( setter );
	}
	ssl(src);
	return ssl;
	
	function setProp(prop, val) { 
		this[prop] = val; 
	}
}

_.each(	['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout', 'dragstart', 'drag', 'dragenter', 
		'dragleave', 'dragover', 'drop', 'dragend', 'keydown', 'keypress', 'keyup', 'select', 'input', 'change', 'submit', 'reset', 'focus', 'blur'], 
	function(ev) {  
		Sigel.prototype[ev] = function (getter) { 
			return domSig( ev, ev, getter, this.el ); 
		};
		Sigel.prototype['$'+ev] = function (selector, getter) { 
			return domLiveSig( ev, this, selector, ev, getter ); 
		};
	});

Sigel.prototype.keyChar = function (getter) { 
	return domSig( 'keyChar', 'keypress', 
		function(e) { return String.fromCharCode(e.keyCode)}, 
		this.el ); 
};
Sigel.prototype.keyCode = function (code) { 
	return domSig( 'keyCode', 'keypress', '.keyCode', this.el ).filter(code); 
};

_.each(	[	['val'		,'input'	,'value'], 
			['checked'	,'change'	,'checked']
		], 
	function( opt ) {
		var sig = opt[0], defEv = opt[1], prop = opt[2];
		Sigel.prototype[opt[0]] = function( ev ) {
			return domSig( sig, ev || defEv, '.target.'+prop, this.el, this.el[prop] );  
		} 
	});
		
_.each(	[	['text'		,'textContent'],
			['html'		,'innerHTML'],
			['append'	,'appendChild'],
			['remove'	,'removeChild'],
			['visible'	,setVisible],
			['css'		,setCss],
			['style'	,setStyle],
			['attr'		,setAttr]
		], 
	function( opt ) {
		var slot = opt[0], setter = opt[1];
		Sigel.prototype[opt[0]] = function( src ) {
			return domSlot( slot, setter, this.el, src );  
		}
	});


function setVisible( v ) { 
	if(!v) this.style.display = 'none';
	else this.style.removeProperty('display');  
}

function setCss( val ) {
	var me = this;
	var sel = sigel(this);
	var oldclss = sel.$$dyncss;
	sel.$$dyncss = _.isObj( val ) ?  
						_.filter( Object.keys( val ), _.objGetter(val) ) : 
						String( val || '' ).match(/\S+/g);
	if(oldclss) _.each( oldclss, function(c) { me.classList.remove(c); } );
	if(sel.$$dyncss) _.each( sel.$$dyncss, function(c) { me.classList.add(c); } );
}

function setStyle( val ) {
	var me = this;
	var sel = sigel(this);
	var oldstyles = sel.$$dynstyles;
	sel.$$dynstyles = _.isObj( val ) ?  Object.keys(val) : null;
	if(oldstyles) _.each( oldstyles, function(s) { me.style.removeProperty(s); } );
	if(sel.$$dynstyles) _.each( sel.$$dynstyles, function(s) { me.style[s] = val[s]; } );
}

function setAttr( val ) {
	var me = this;
	var sel = sigel(this);
	var oldattrs = sel.$$dynattrs;
	sel.$$dynattrs = _.isObj( val ) ?  Object.keys(val) : null;
	if(oldattrs) _.each( oldattrs, function( a ) { me.removeAttribute(a); } );
	if(sel.$$dynattrs) _.each( sel.$$dynattrs, function( a ) { me.setAttribute( a, val[a].toString() ); } );
}
})()

