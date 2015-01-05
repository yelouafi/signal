(function() {

var ss = window.ss, _ = window.ss_;
ss.ajaxSig = ajaxSig;

function queryString(obj) {
	var res = [];
	_.eachKey( obj, function(val, key) {
		res.push( encodeURIComponent(key) + '=' + encodeURIComponent(val) );
	} )
	return res.join('&');
}

function ajaxSig( req ) {
	var xhr = new XMLHttpRequest(), sig = ss.signal();
	
	if(req.headers)
		_.eachKey( req.headers, function(val, key) {
			xhr.setRequestHeader(key, val);
		});
	req = _.isStr(req) ? { method: 'GET', url: req } : req;
	req.method = (req.method || 'GET').toUpperCase();
	req.url = req.url + (req.data && req.method === 'GET' ? '?'+queryString(req.data)  : "");
	xhr.onreadystatechange = handler;
	xhr.open( req.method, req.url );
	xhr.send();
	
	return sig;
	
	function handler() {
		if (xhr.readyState === 4) {
			sig.$$emit(xhr);
		}
	}
}

})();