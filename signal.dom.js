(function() {

var ss = window.ss, _ = window.ss_;
ss.parse = parseHtml
window.$$ = sigel;
window.$t = nodeFromString;

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

function parseHtml(str) {
	var idx = 0, el = { tag: 'div', classes:[], attrs: {} },
		voidTags = /^(AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TRACK|WBR)$/i;
	skip();
	if( isAlpha() )
		el.tag = name();
	skip();
	if( match('#') ) 
		el.attrs.id = name();
	skip();
	while( match('.') ) {
		skip();
		el.classes.push( name() );
	}
	skip();
	if( match('[') ) {
		var cont = true;
		while(str[idx] !== ']' && cont) {
			skip();
			attr();
			skip();
			cont = match(',');
		}
		expect(']');
	}
	el.$$void = voidTags.test(el.tag);
	return el;
					
	function neof() { return idx < str.length; }
	function isSpace() { return /\s/.test(str[idx]); }
	function isAlpha() { return /[a-zA-Z0-9]/.test(str[idx]); }
	function skip() { while( neof() && isSpace() ) idx++; }
	function match(ch) { if( neof() && ch === str[idx] ) return ++idx; }
	function expect(ch) {
		if( !neof() ) throw "HTML template syntax error, unexpected end of template, expected '" + ch + "'";
		if( str[idx] === ch ) idx++;
		else throw "HTML template syntax error, expected "+ch+", found '" + str[idx] + "'";
	}
	function name() {
		var sidx = idx;
		while( neof() && isAlpha() ) idx++;
		return str.slice(sidx, idx);
	}
	function attrName() {
		var sidx = idx;
		while( neof() && !/["'>\/\=\s]/.test(str[idx]) ) idx++;
		return str.slice(sidx, idx);
	}
	function quotedVal(q) {
		var sidx = idx;
		expect(q);
		while( neof() && (str[idx] !== q) ) idx++;
		expect(q);
		return str.slice(sidx, idx);
	}
	function unquotedVal() {
		var sidx = idx;
		while( neof() && !/["'><\=`\s,]/.test(str[idx]) ) idx++;
		return str.slice(sidx, idx);
	}
	function attr() {
		var sidx = idx;
		var attr = attrName();
		skip();
		if( match('=') ) {
			skip();
			var ch = str[idx];
			el.attrs[attr] = (ch === '"' || ch === "'") ? quotedVal(ch) : unquotedVal();
		} else
			el.attrs[attr] = undefined;
	}
}

function buildNode(html, config, body) {
	var el = parseHtml(html);
	body = _.isArray(body) ? body : _.slice(arguments, 2);
    var tmp = document.createElement('body');
    tmp.innerHTML = html;
    var node = tmp.removeChild( tmp.firstChild );
	_.eah(body, function(sel) {
		node.appendChild( sel.el );
	}); 
    tmp = null;
	return sigel(node, config);
	
	function buildHtml(el) {
		'<' + el.tag + ' ' + (el.classes.length ? 'class="' + el.classes.join(' ') + '" ' : '')
			+ _.map( Object.keys(el.attrs), function(k) {
				return k + ( el.attrs[k] ? '=' + el.attrs[k] : '' );
			} ).join(' ')
			+ (el.$$void ? '/>' : '></' + el.tag + '>' );
	}
}
	
function Sigel(el, config) {
	var me = this;
	this.el = el;
	this.$$signals = {};
	this.$$slots = {};
	this.$$on = delegate(this.el);
	
	if(config) 
		_.eachKey(config, function(slotName, sig) {
			var slot = me.$$slots[slotName];
			if(slot) {
				slot(sig);
			}
		});
}

Sigel.prototype.signal = function ( selector/* opt */, event, getter ) {
	var me = this;
	if(arguments.length < 4) 
		return this.signal(null, selector, event, getter);
	var sig = this.$$signals[event];
	if( !sig ) {
		var events = _.isArray(event) ? event : event.trim().split(/\s+/g);
		sig = ss.signal();
		_.each(events, function(ev) {
			me.$$on( selector, ev, sig.$$emit.bind(sig) ); 
		});
		this.$$signals[event] = sig;
	}
	return sig.map( _.fapply( getter || _.id ) );
}

Sigel.prototype.prop = function(changeEvents, getter)  {
	getter = _.bindl( _.fapply( getter || _.id ), this.el);
	return ss.def( getter(), this.signal(null, changeEvents, getter) );
}

Sigel.prototype.slot = function( slotName, setter, src ) {
	setter = _.isStr(setter) ? setProp.bind( this, setter ) : _.fn( setter ).bind( this );
	var sl = this.$$slots[slotName] = ss.slot( setter );
	sl(src);
	return sl;
	
	function setProp(prop, val) { 
		this.el[prop] = val; 
	}
}

var sigelCache = window.$sigcache = {}, uuid = 0;
window.$document = new Sigel(document);
function sigel(el, config) {
	if(el === document) return window.$document;
	el = el instanceof Element ? el : document.getElementById(el) );
	var ret = sigelCache[el.dataset.segid];
	if( !ret ) {
		el.dataset.segid = ++uuid;
		ret = sigelCache[uuid] =  new Sigel(el, config);
	}
	return ret;
}


_.each(	['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout', 'dragstart', 'drag', 'dragenter', 
		'dragleave', 'dragover', 'drop', 'dragend', 'keydown', 'keypress', 'keyup', 'select', 'input', 'change', 'submit', 'reset', 'focus', 'blur'], 
	function(event) {  
		Sigel.prototype[event] = function (getter) { 
			return this.signal( event, getter ); 
		};
	});

Sigel.prototype.keyChar = function (ch) {
	var sig = this.signal( 'keypress', function(e) { 
		return String.fromCharCode(e.keyCode)
	});
	return arguments.length ? sig.filter(ch) : sig;
};
Sigel.prototype.keyCode = function (code) { 
	var sig = this.signal( 'keypress', '.keyCode');
	return arguments.length ? sig.filter(code) : sig;
};

_.each(	[	['val'		,'change'	,'value'], 
			['checked'	,'change'	,'checked']
		], 
	function( opt ) {
		var name = opt[0], defaultEvent = opt[1], prop = opt[2];
		Sigel.prototype[name] = function( event ) {
			return this.prop( event || defaultEvent, '.'+prop );  
		} 
	});
		
_.each(	[	['text'		,'textContent'],
			['html'		,'innerHTML'],
			['append'	,append],
			['remove'	,remove],
			['visible'	,setVisible],
			['css'		,setCss],
			['style'	,setStyle],
			['attr'		,setAttr]
		], 
	function( opt ) {
		var slot = opt[0], setter = opt[1];
		Sigel.prototype[slot] = function( src ) {
			return this.slot( setter, src );  
		}
	});

function append( child ) {
	this.el.appendChild(
		child instanceof Sigel	? child.el :
		_.isStr(child) 			? nodeFromString(child) :
		/* otherwise 			*/child
	)
}

function remove( child ) {
	this.el.removeChild( child instanceof Sigel	? child.el : child );
}

function setVisible( v ) { 
	if(!v) this.el.style.display = 'none';
	else this.el.style.removeProperty('display');  
}

function setCss( val ) {
	var me = this;
	if(me.$$css) _.each( me.$css, function(c) { me.el.classList.remove(c); } );
	me.$$css = _.isObj(val)	? _.filter( Object.keys(val), _.objGetter(val) ) :
				_.isStr(val)	? val.match(/\S+/g) :
				_.isArray(val)	? val :
				/* otherwise 	*/undefined;
	if(me.$$css) _.each( sel.$$css, function(c) { me.el.classList.add(c); } );
}

function setStyle( val ) {
	var me = this;
	if(me.$$styles) _.each( me.$$styles, function(s) { me.el.style.removeProperty(s); } );
	me.$$styles = _.isObj( val ) ?  Object.keys(val) : null;
	if(me.$$styles)	_.each( me.$$styles, function(s) { me.el.style[s] = val[s]; } );
}

function setAttr( val ) {
	var me = this;
	if(me.$$attrs) _.each( me.$$attrs, function( a ) { me.el.removeAttribute(a); } );
	me.$$attrs = _.isObj( val ) ?  Object.keys(val) : null;
	if(me.$$attrs) _.each( me.$$attrs, function( a ) { me.el.setAttribute( a, val[a].toString() ); } );
}
})()

