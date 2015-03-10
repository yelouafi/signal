var _ = require("./static.js"),
    ss = require("./reactive.js"),
    signal = ss.signal;
    
var su = {}
    
su.timeout = function(ms) {
	var sig = ss.signal(0);
	setTimeout(function() {
		sig.$$emit(ms);
	}, ms);
	return sig;
}
    
su.timer = function timer ( prec, startEvOrDelay, stopEvOrTicks  ) {
	var iv,
		sig = signal(0),
		start = ss.isSig(startEvOrDelay) ? startEvOrDelay : 
				isFinite(startEvOrDelay) ? su.timeout(startEvOrDelay) :
				/* otherwise			*/ ss.now(),
				
		stop =  ss.isSig(stopEvOrTicks) ? stopEvOrTicks : 
				isFinite(stopEvOrTicks)  ? sig.whenEq(stopEvOrTicks) :
				ss.never();
	
	start.on(startTimer);
	stop.on(stopTimer);
	return sig;
	
	function startTimer() { 
	    iv = setInterval( emit, prec );
	    start.off(startTimer);
	}
	
	function stopTimer() {
		if(iv) {
			clearInterval(iv);
		}
		stop.off( stopTimer );
	}
	
	function emit() { 
		sig.$$emit( sig.$$currentValue + 1 );
	}
};

su.clock = function clock( start, stop ) {
	return su.timer( 1000, start, stop ).map( function( ms ) { return new Date(ms); } )
};

su.seconds = function seconds( start, stop ) {
	return su.timer( 1000, start, stop );
};

su.fromArray = function signalFromArray(array, interval, delay) {
	return interval ? withInterval() : withoutInterval();

	function withInterval() {
		return su.timer(interval, delay || 0, array.length).map(_.objGetter(array));
	}
	
	function withoutInterval() {
		var sig = signal();
		setTimeout(function() {
			_.each(array, sig.$$emit.bind(sig));
		}, 0);
		return sig;
	}
};


module.exports = su;