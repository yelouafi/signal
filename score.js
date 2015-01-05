(function() {

var _ = window.ss_ = {};
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
_.or 			= function() { return any( arguments, id ); }
_.and 			= function() { return first( arguments, not ) === -1 }
_.noop			= function noop() {}
_.id			= function(val) { return val; }
_.val			= function(val) {  return function() { return val; } }
_.truthy		= _.val(true);
_.falsy			= _.val(false); 
_.fn			= function(arg, alt) { return _.isFn( arg ) ? arg : (alt || _.val(arg)); }
_.callw		= function() { 
	var bargs = _.slice(arguments);
	return function( fn ) {
		return fn.apply( null, bargs );
	}
}
_.bind	= Function.prototype.bind;
_.bindl	= function(fn) { 
	return _.bind.apply( fn, [null].concat( _.slice(arguments, 1 )) ); 
}
_.bindr	= function(fn) {
	var bargs = _.slice( arguments, 1 );
	return function() { 
		return fn.apply( null, _.slice(arguments).concat(bargs) );
	} 
}

_.head = function(arr) { return arr[arr.length-1] };
_.each = function(iter, cb, exit) {
	exit = _.fn( exit, _.falsy );
	for(var i = 0, l = iter.length; i < l; i++) {
		var val = iter[i];
		if( exit( val, i) ) return;
		cb( val, i );
	}
}
_.any = function(iter, test) {
	test = _.fn( test, _.eq(test) );
	for(var i = 0, l = iter.length; i < l; i++)
		if ( test(iter[i]) ) return true;
	return false;
}
_.first = function(iter, test) {
	test = _.fn( test, _.eq(test) );
	for(var i = 0, l = iter.length; i < l; i++)
		if ( test(iter[i]) ) return i;
	return -1;
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
_.applyEach		= function(fns, target) { return ( _.isObj(fns) ? _.mapObj : _.map )( fns, callw(target) ); }
_.getProp		= function(path, obj) { return _.pipe( _.map( path, _.propGetter ), _.isObj )(obj); }

_.freduce = function( state, fn ) {
	return function(value) { return ( state = fn( state, value ) ); }
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
				hasMethod = head.indexOf('()') === (head.length - 2),
				fprop = _.bindl( _.getProp, path );
			if(!hasMethod) 
				return fprop;
			else 
				return function(v) {
					args = map( args, function(v) { return _.isFn(v) ? v() : v; } )
					return fprop.apply( v, args );
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

})()