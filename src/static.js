

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