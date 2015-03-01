var _ = require("./static.js"),
    ss = require("./reactive.js"),
    signal = ss.signal;
    
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