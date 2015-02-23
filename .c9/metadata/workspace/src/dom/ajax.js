{"changed":true,"filter":false,"title":"ajax.js","tooltip":"/src/dom/ajax.js","value":"var _ = require('../base.js');\nvar signal = require('../signal.js');\nvar ss = require('../comb.js');\n\nfunction queryString(obj) {\n\tvar res = [];\n\t_.eachKey( obj, function(val, key) {\n\t\tres.push( encodeURIComponent(key) + '=' + encodeURIComponent(val) );\n\t} )\n\treturn res.join('&');\n}\n\nfunction ajaxSig( req ) {\n\tvar xhr = new XMLHttpRequest(), sig = ss.signal();\n\t\n\tif(req.headers)\n\t\t_.eachKey( req.headers, function(val, key) {\n\t\t\txhr.setRequestHeader(key, val);\n\t\t});\n\treq = _.isStr(req) ? { method: 'GET', url: req } : req;\n\treq.method = (req.method || 'GET').toUpperCase();\n\treq.url = req.url + (req.data && req.method === 'GET' ? '?'+queryString(req.data)  : \"\");\n\txhr.onreadystatechange = handler;\n\txhr.open( req.method, req.url );\n\txhr.send();\n\t\n\treturn sig;\n\t\n\tfunction handler() {\n\t\tif (xhr.readyState === 4) {\n\t\t\tsig.$$emit(xhr);\n\t\t}\n\t}\n}\n\nmodule.exports = ajaxSig;","undoManager":{"mark":-1,"position":27,"stack":[[{"group":"doc","deltas":[{"start":{"row":0,"column":0},"end":{"row":0,"column":13},"action":"remove","lines":["(function() {"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":0},"end":{"row":36,"column":5},"action":"remove","lines":["})();"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":0},"end":{"row":36,"column":1},"action":"insert","lines":["m"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":1},"end":{"row":36,"column":2},"action":"insert","lines":["o"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":2},"end":{"row":36,"column":3},"action":"insert","lines":["d"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":3},"end":{"row":36,"column":4},"action":"insert","lines":["u"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":4},"end":{"row":36,"column":5},"action":"insert","lines":["l"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":0},"end":{"row":36,"column":5},"action":"remove","lines":["modul"]},{"start":{"row":36,"column":0},"end":{"row":36,"column":6},"action":"insert","lines":["module"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":6},"end":{"row":36,"column":7},"action":"insert","lines":["."]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":7},"end":{"row":36,"column":8},"action":"insert","lines":["e"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":8},"end":{"row":36,"column":9},"action":"insert","lines":["x"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":9},"end":{"row":36,"column":10},"action":"insert","lines":["p"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":10},"end":{"row":36,"column":11},"action":"insert","lines":["o"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":7},"end":{"row":36,"column":11},"action":"remove","lines":["expo"]},{"start":{"row":36,"column":7},"end":{"row":36,"column":14},"action":"insert","lines":["exports"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":14},"end":{"row":36,"column":15},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":15},"end":{"row":36,"column":16},"action":"insert","lines":["="]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":16},"end":{"row":36,"column":17},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":17},"end":{"row":36,"column":18},"action":"insert","lines":["a"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":18},"end":{"row":36,"column":19},"action":"insert","lines":["j"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":19},"end":{"row":36,"column":20},"action":"insert","lines":["a"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":17},"end":{"row":36,"column":20},"action":"remove","lines":["aja"]},{"start":{"row":36,"column":17},"end":{"row":36,"column":26},"action":"insert","lines":["ajaxSig()"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":25},"end":{"row":36,"column":26},"action":"remove","lines":[")"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":24},"end":{"row":36,"column":25},"action":"remove","lines":["("]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":24},"end":{"row":36,"column":25},"action":"insert","lines":[";"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":0},"end":{"row":3,"column":21},"action":"remove","lines":["var ss = window.ss, _ = window.ss_;","ss.ajaxSig = ajaxSig;"]}]}],[{"group":"doc","deltas":[{"start":{"row":1,"column":0},"end":{"row":2,"column":0},"action":"remove","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":0,"column":0},"end":{"row":1,"column":0},"action":"remove","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":0,"column":0},"end":{"row":2,"column":31},"action":"insert","lines":["var _ = require('../base.js');","var signal = require('../signal.js');","var ss = require('../comb.js');"]}]}]]},"ace":{"folds":[],"scrolltop":0,"scrollleft":0,"selection":{"start":{"row":2,"column":31},"end":{"row":2,"column":31},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":0},"timestamp":1424635596758}