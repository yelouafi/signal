{"filter":false,"title":"signal.js","tooltip":"/src/signal.js","undoManager":{"mark":17,"position":17,"stack":[[{"group":"doc","deltas":[{"start":{"row":3,"column":0},"end":{"row":4,"column":0},"action":"insert","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":0},"end":{"row":5,"column":0},"action":"insert","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":5,"column":0},"end":{"row":23,"column":0},"action":"insert","lines":["function EventHelper() { ","\tthis.slots = [];","}","","EventHelper.prototype.on = function(slot) {","    _.add(this.slots, slot, true); ","};","","EventHelper.prototype.off = function(slot) { ","    _.remove(this.slots, slot); ","};","","EventHelper.prototype.emit = function (data) { ","\t_.each( ","\t    this.slots, ","\t    _.callw( data )","    ); ","};",""]}]}],[{"group":"doc","deltas":[{"start":{"row":1,"column":0},"end":{"row":1,"column":31},"action":"remove","lines":["\tEvent = require('./event.js'),"]}]}],[{"group":"doc","deltas":[{"start":{"row":0,"column":31},"end":{"row":1,"column":0},"action":"remove","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":31,"column":30},"end":{"row":31,"column":31},"action":"insert","lines":["H"]}]}],[{"group":"doc","deltas":[{"start":{"row":31,"column":31},"end":{"row":31,"column":32},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":31,"column":31},"end":{"row":31,"column":32},"action":"remove","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":31,"column":25},"end":{"row":31,"column":31},"action":"remove","lines":["EventH"]},{"start":{"row":31,"column":25},"end":{"row":31,"column":36},"action":"insert","lines":["EventHelper"]}]}],[{"group":"doc","deltas":[{"start":{"row":37,"column":1},"end":{"row":37,"column":15},"action":"remove","lines":["this.$$init();"]}]}],[{"group":"doc","deltas":[{"start":{"row":37,"column":0},"end":{"row":37,"column":1},"action":"remove","lines":["\t"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":1},"end":{"row":37,"column":0},"action":"remove","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":0},"end":{"row":36,"column":1},"action":"remove","lines":["\t"]}]}],[{"group":"doc","deltas":[{"start":{"row":35,"column":18},"end":{"row":36,"column":0},"action":"remove","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":5},"end":{"row":51,"column":6},"action":"insert","lines":["!"]}]}],[{"group":"doc","deltas":[{"start":{"row":52,"column":24},"end":{"row":52,"column":29},"action":"remove","lines":["neant"]},{"start":{"row":52,"column":24},"end":{"row":52,"column":25},"action":"insert","lines":["v"]}]}],[{"group":"doc","deltas":[{"start":{"row":52,"column":25},"end":{"row":52,"column":26},"action":"insert","lines":["a"]}]}],[{"group":"doc","deltas":[{"start":{"row":52,"column":26},"end":{"row":52,"column":27},"action":"insert","lines":["l"]}]}]]},"ace":{"folds":[],"scrolltop":408.5,"scrollleft":0,"selection":{"start":{"row":50,"column":20},"end":{"row":50,"column":20},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":{"row":152,"mode":"ace/mode/javascript"}},"timestamp":1425061322000,"hash":"c7121f11984125a39473c5c6b064ea9603a3eb28"}