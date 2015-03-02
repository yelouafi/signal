{"filter":false,"title":"utils.js","tooltip":"/src/utils.js","undoManager":{"mark":36,"position":36,"stack":[[{"group":"doc","deltas":[{"start":{"row":0,"column":0},"end":{"row":1,"column":0},"action":"insert","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":1,"column":0},"end":{"row":49,"column":1},"action":"insert","lines":["ss.timer = function timer ( prec, stop ) {","\tvar sig = signal( Date.now() ),","\t\tiv = start(),","\t\tcount = 0;","\t\t","\tif( ss.isSig(stop) )","\t\tstop.on( stopTimer );","\t\t","\treturn sig;","","\tfunction start() { ","\t    return setInterval( emit, prec );","\t}","\t","\tfunction emit() { ","\t\tsig.$$emit( count );","\t\tif ( stop && isFinite(stop) && (++count) >= stop ) ","\t\t\tclearInterval( iv );","\t\t","\t}","\tfunction stopTimer() {","\t\tif(iv) clearInterval( iv );","\t\tstop.off( stopTimer );","\t}","};","","ss.clock = function clock( stop ) {","\treturn ss.timer( 1000, stop ).map( function( ms ) { return new Date(ms); } )","};","","ss.seconds = function seconds( stop ) {","\treturn ss.timer( 1000, stop ).counter();","};","","ss.fromArray = function signalFromArray(array, interval) {","\treturn interval ? withInterval() : withoutInterval();","","\tfunction withInterval() {","\t\treturn ss.timer(interval, array.length).map(_.objGetter(array));","\t}","\t","\tfunction withoutInterval() {","\t\tvar sig = signal();","\t\tsetTimeout(function() {","\t\t\t_.each(array, sig.$$emit.bind(sig));","\t\t}, 0);","\t\treturn sig;","\t}","}"]}]}],[{"group":"doc","deltas":[{"start":{"row":0,"column":0},"end":{"row":1,"column":34},"action":"insert","lines":["var _ = require(\"./static.js\"),","    ss = require(\"./reactive.js\");"]}]}],[{"group":"doc","deltas":[{"start":{"row":1,"column":34},"end":{"row":2,"column":0},"action":"insert","lines":["",""]},{"start":{"row":2,"column":0},"end":{"row":2,"column":4},"action":"insert","lines":["    "]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":1},"end":{"row":52,"column":0},"action":"insert","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":52,"column":0},"end":{"row":53,"column":0},"action":"insert","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":53,"column":0},"end":{"row":120,"column":1},"action":"insert","lines":["function signal() {","\t","\tsigval.map = function( getter, args /*...*/ ) {","\t    args = _.slice(arguments,1);","\t\treturn ss.map( sigval, _.fapply.apply( null, [].concat( getter, args ) ) )","\t};","\t","\tsigval.val = function (val) {","\t\treturn ss.map( sigval, _.val(val) );","\t};","\t","\tsigval.fold = _.bindl( ss.fold, sigval );","\t","\tsigval.filter = _.bindl( ss.filter, sigval);","\t_.each( ['eq', 'notEq', 'gt', 'gte', 'lt', 'lte'], function( key ) {","\t\tvar fpred = _[key],","\t\t\tpred = function(me, other) { return fpred(me)(other) };","\t\tsigval[key] = function(sig) {","\t\t\tsig = ss.makeSig(sig);","\t\t    return ss.map( sigval, sig, pred);","\t\t};","\t\t","\t\tvar whenKey = 'when'+key.charAt(0).toUpperCase() + key.slice(1);","\t\tsigval[whenKey] = function(sig) {","\t\t\tsig = ss.makeSig(sig);","\t\t    return ss.filter( sigval, sig, pred);","\t\t};","\t});","\t","\tsigval.not = function() {","\t\treturn ss.map(sigval, function(v) { return !v });","\t}","\t","\tsigval.and = _.bindl( ss.and, sigval );","\t","\tsigval.merge = _.bindl( ss.merge, sigval );","\t","\tsigval.counter = _.bindl( ss.fold, sigval, 0, _.inc );","\t","\tsigval.occ = discrete ? sigval : ss.merge( sigval );","\t","\tsigval.keep = function(start) {","\t\treturn ss.def(start, [sigval, _.id]);","\t}","\t","\tsigval.tap = function(proc) {","\t\treturn ss.map(sigval, function(v) {","\t\t\tproc(v);","\t\t\treturn v;","\t\t})","\t}","\t","\tsigval.printDeps = function(level) {","\t\tlevel = level || 0;","\t\tconsole.log( indent(level) + sigval.$$name );","\t\t_.each( sigval.$$deps, function(s) {","\t\t\ts.printDeps(level+1);","\t\t});","\t}","\t","\tfunction sigval() { ","\t\tif( DepsTracker.tracking() ) ","\t\t\tDepsTracker.addDep( sigval );","\t\treturn currentValue;","\t}","\t","\treturn sigval;","}"]}]}],[{"group":"doc","deltas":[{"start":{"row":55,"column":1},"end":{"row":111,"column":2},"action":"remove","lines":["sigval.map = function( getter, args /*...*/ ) {","\t    args = _.slice(arguments,1);","\t\treturn ss.map( sigval, _.fapply.apply( null, [].concat( getter, args ) ) )","\t};","\t","\tsigval.val = function (val) {","\t\treturn ss.map( sigval, _.val(val) );","\t};","\t","\tsigval.fold = _.bindl( ss.fold, sigval );","\t","\tsigval.filter = _.bindl( ss.filter, sigval);","\t_.each( ['eq', 'notEq', 'gt', 'gte', 'lt', 'lte'], function( key ) {","\t\tvar fpred = _[key],","\t\t\tpred = function(me, other) { return fpred(me)(other) };","\t\tsigval[key] = function(sig) {","\t\t\tsig = ss.makeSig(sig);","\t\t    return ss.map( sigval, sig, pred);","\t\t};","\t\t","\t\tvar whenKey = 'when'+key.charAt(0).toUpperCase() + key.slice(1);","\t\tsigval[whenKey] = function(sig) {","\t\t\tsig = ss.makeSig(sig);","\t\t    return ss.filter( sigval, sig, pred);","\t\t};","\t});","\t","\tsigval.not = function() {","\t\treturn ss.map(sigval, function(v) { return !v });","\t}","\t","\tsigval.and = _.bindl( ss.and, sigval );","\t","\tsigval.merge = _.bindl( ss.merge, sigval );","\t","\tsigval.counter = _.bindl( ss.fold, sigval, 0, _.inc );","\t","\tsigval.occ = discrete ? sigval : ss.merge( sigval );","\t","\tsigval.keep = function(start) {","\t\treturn ss.def(start, [sigval, _.id]);","\t}","\t","\tsigval.tap = function(proc) {","\t\treturn ss.map(sigval, function(v) {","\t\t\tproc(v);","\t\t\treturn v;","\t\t})","\t}","\t","\tsigval.printDeps = function(level) {","\t\tlevel = level || 0;","\t\tconsole.log( indent(level) + sigval.$$name );","\t\t_.each( sigval.$$deps, function(s) {","\t\t\ts.printDeps(level+1);","\t\t});","\t}"]}]}],[{"group":"doc","deltas":[{"start":{"row":53,"column":0},"end":{"row":64,"column":1},"action":"remove","lines":["function signal() {","\t","\t","\t","\tfunction sigval() { ","\t\tif( DepsTracker.tracking() ) ","\t\t\tDepsTracker.addDep( sigval );","\t\treturn currentValue;","\t}","\t","\treturn sigval;","}"]}]}],[{"group":"doc","deltas":[{"start":{"row":52,"column":0},"end":{"row":53,"column":0},"action":"remove","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":1},"end":{"row":52,"column":0},"action":"remove","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":1,"column":33},"end":{"row":1,"column":34},"action":"remove","lines":[";"]}]}],[{"group":"doc","deltas":[{"start":{"row":1,"column":33},"end":{"row":1,"column":34},"action":"insert","lines":[","]}]}],[{"group":"doc","deltas":[{"start":{"row":1,"column":34},"end":{"row":2,"column":0},"action":"insert","lines":["",""]},{"start":{"row":2,"column":0},"end":{"row":2,"column":4},"action":"insert","lines":["    "]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":4},"end":{"row":2,"column":5},"action":"insert","lines":["s"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":5},"end":{"row":2,"column":6},"action":"insert","lines":["i"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":6},"end":{"row":2,"column":7},"action":"insert","lines":["g"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":7},"end":{"row":2,"column":8},"action":"insert","lines":["n"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":8},"end":{"row":2,"column":9},"action":"insert","lines":["a"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":9},"end":{"row":2,"column":10},"action":"insert","lines":["l"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":10},"end":{"row":2,"column":11},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":11},"end":{"row":2,"column":12},"action":"insert","lines":["="]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":12},"end":{"row":2,"column":13},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":13},"end":{"row":2,"column":14},"action":"insert","lines":["q"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":14},"end":{"row":2,"column":15},"action":"insert","lines":["q"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":14},"end":{"row":2,"column":15},"action":"remove","lines":["q"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":13},"end":{"row":2,"column":14},"action":"remove","lines":["q"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":13},"end":{"row":2,"column":14},"action":"insert","lines":["s"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":14},"end":{"row":2,"column":15},"action":"insert","lines":["s"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":15},"end":{"row":2,"column":16},"action":"insert","lines":["."]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":16},"end":{"row":2,"column":17},"action":"insert","lines":["s"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":17},"end":{"row":2,"column":18},"action":"insert","lines":["i"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":18},"end":{"row":2,"column":19},"action":"insert","lines":["g"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":19},"end":{"row":2,"column":20},"action":"insert","lines":["n"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":16},"end":{"row":2,"column":20},"action":"remove","lines":["sign"]},{"start":{"row":2,"column":16},"end":{"row":2,"column":24},"action":"insert","lines":["signal()"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":22},"end":{"row":2,"column":24},"action":"remove","lines":["()"]}]}],[{"group":"doc","deltas":[{"start":{"row":2,"column":22},"end":{"row":2,"column":23},"action":"insert","lines":[";"]}]}]]},"ace":{"folds":[],"scrolltop":0,"scrollleft":0,"selection":{"start":{"row":2,"column":23},"end":{"row":2,"column":23},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":0},"timestamp":1425058775285,"hash":"fa4941dc3ebea7071aac6d3421814197df8b869a"}