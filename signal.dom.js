(function() {

var ss = window.ss, _ = window.ss.fn;
window.$$ = sigel;
ss.domSig= domSig;
ss.domSlot = domSlot;
	
function Sigel(el) {
	this.el = el;
	this.signals = {};
	this.slots = {};
}

var sigelCache = window.$sigcache = { $doc: new Sigel(document) }, uuid = 0;
function sigel(el) {
	if(el === document) return $doc;
	el = el instanceof Element ? el : document.getElementById(el);
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
		var events = Array.isArray(event) ? event : event.trim().split(/\s+/g);
		sig = ss.signal();
		_.each(events, function(ev) {
			target.addEventListener( ev, sig.$$emit.bind(sig) ); 
		});
		sel.signals[sigkey] = sig;
	}
	var fn = _.template( getter, target );
	return init ? sig.map( fn ) : ss.def( init, [sig, fn] );
}

function domSlot( slotName, setter, target, src ) {
	target = target instanceof EventTarget ? target : document.getElementById(target);
	var sel = sigel(target);
	var ssl = sel.slots[slotName];
	if( !ssl ) {
		setter = _.isStr(setter) ? setProp.bind( target, setter ) : _.makeFn( setter ).bind( target );
		ssl = sel.slots[slotName] = ss.slot( setter );
	}
	ssl(src);
	return ssl;
	
	function setProp(prop, val) { 
		this[prop] = val; 
	}
}

_.each(	['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout', 'dragstart', 'drag', 'dragenter', 
		'dragleave', 'dragover', 'drop', 'dragend', 'keydown', 'keypress', 'keyup', 'select', 'change', 'submit', 'reset', 'focus', 'blur'], 
	function(ev) {  
		Sigel.prototype[ev] = function (getter) { 
			return domSig( ev, ev, getter, this.el ); 
		};
	});

_.each( 	[	['val'		,'input'	,'value'], 
			['checked'	,'change'	,'checked']
		], 
	function( opt ) {
		var sig = opt[0], defEv = opt[1], prop = opt[2];
		Sigel.prototype[opt[0]] = function( ev ) {
			return domSig( sig, ev || defEv, '#.'+prop, this.el, this.el[prop] );  
		} 
	});
		
_.each(	[	['text'		,'textContent'],
			['html'		,'innerHTML'],
			['append'	,'appendChild'],
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
						_.filter( Object.keys( val ), objGetter(val) ) : 
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

