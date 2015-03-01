var _ = require("./static.js"),
    ss = require("./reactive.js");

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