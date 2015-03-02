{"filter":false,"title":"signal.js","tooltip":"/src/signal.js","ace":{"folds":[],"scrolltop":300,"scrollleft":0,"selection":{"start":{"row":47,"column":16},"end":{"row":47,"column":16},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":{"row":178,"mode":"ace/mode/javascript"}},"hash":"f2f13f05199f4b2c0b259829550e1918a09fd3c2","undoManager":{"mark":66,"position":66,"stack":[[{"group":"doc","deltas":[{"start":{"row":3,"column":0},"end":{"row":4,"column":0},"action":"insert","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":4,"column":0},"end":{"row":5,"column":0},"action":"insert","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":5,"column":0},"end":{"row":23,"column":0},"action":"insert","lines":["function EventHelper() { ","\tthis.slots = [];","}","","EventHelper.prototype.on = function(slot) {","    _.add(this.slots, slot, true); ","};","","EventHelper.prototype.off = function(slot) { ","    _.remove(this.slots, slot); ","};","","EventHelper.prototype.emit = function (data) { ","\t_.each( ","\t    this.slots, ","\t    _.callw( data )","    ); ","};",""]}]}],[{"group":"doc","deltas":[{"start":{"row":1,"column":0},"end":{"row":1,"column":31},"action":"remove","lines":["\tEvent = require('./event.js'),"]}]}],[{"group":"doc","deltas":[{"start":{"row":0,"column":31},"end":{"row":1,"column":0},"action":"remove","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":31,"column":30},"end":{"row":31,"column":31},"action":"insert","lines":["H"]}]}],[{"group":"doc","deltas":[{"start":{"row":31,"column":31},"end":{"row":31,"column":32},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":31,"column":31},"end":{"row":31,"column":32},"action":"remove","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":31,"column":25},"end":{"row":31,"column":31},"action":"remove","lines":["EventH"]},{"start":{"row":31,"column":25},"end":{"row":31,"column":36},"action":"insert","lines":["EventHelper"]}]}],[{"group":"doc","deltas":[{"start":{"row":37,"column":1},"end":{"row":37,"column":15},"action":"remove","lines":["this.$$init();"]}]}],[{"group":"doc","deltas":[{"start":{"row":37,"column":0},"end":{"row":37,"column":1},"action":"remove","lines":["\t"]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":1},"end":{"row":37,"column":0},"action":"remove","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":36,"column":0},"end":{"row":36,"column":1},"action":"remove","lines":["\t"]}]}],[{"group":"doc","deltas":[{"start":{"row":35,"column":18},"end":{"row":36,"column":0},"action":"remove","lines":["",""]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":5},"end":{"row":51,"column":6},"action":"insert","lines":["!"]}]}],[{"group":"doc","deltas":[{"start":{"row":52,"column":24},"end":{"row":52,"column":29},"action":"remove","lines":["neant"]},{"start":{"row":52,"column":24},"end":{"row":52,"column":25},"action":"insert","lines":["v"]}]}],[{"group":"doc","deltas":[{"start":{"row":52,"column":25},"end":{"row":52,"column":26},"action":"insert","lines":["a"]}]}],[{"group":"doc","deltas":[{"start":{"row":52,"column":26},"end":{"row":52,"column":27},"action":"insert","lines":["l"]}]}],[{"group":"doc","deltas":[{"start":{"row":49,"column":41},"end":{"row":50,"column":0},"action":"insert","lines":["",""]},{"start":{"row":50,"column":0},"end":{"row":50,"column":1},"action":"insert","lines":["\t"]}]}],[{"group":"doc","deltas":[{"start":{"row":50,"column":1},"end":{"row":50,"column":2},"action":"insert","lines":["i"]}]}],[{"group":"doc","deltas":[{"start":{"row":50,"column":2},"end":{"row":50,"column":3},"action":"insert","lines":["f"]}]}],[{"group":"doc","deltas":[{"start":{"row":50,"column":3},"end":{"row":50,"column":5},"action":"insert","lines":["()"]}]}],[{"group":"doc","deltas":[{"start":{"row":50,"column":4},"end":{"row":50,"column":5},"action":"insert","lines":["t"]}]}],[{"group":"doc","deltas":[{"start":{"row":50,"column":5},"end":{"row":50,"column":6},"action":"insert","lines":["h"]}]}],[{"group":"doc","deltas":[{"start":{"row":50,"column":6},"end":{"row":50,"column":7},"action":"insert","lines":["i"]}]}],[{"group":"doc","deltas":[{"start":{"row":50,"column":7},"end":{"row":50,"column":8},"action":"insert","lines":["s"]}]}],[{"group":"doc","deltas":[{"start":{"row":50,"column":8},"end":{"row":50,"column":9},"action":"insert","lines":["."]}]}],[{"group":"doc","deltas":[{"start":{"row":50,"column":9},"end":{"row":50,"column":10},"action":"insert","lines":["$"]}]}],[{"group":"doc","deltas":[{"start":{"row":50,"column":10},"end":{"row":50,"column":11},"action":"insert","lines":["$"]}]}],[{"group":"doc","deltas":[{"start":{"row":50,"column":11},"end":{"row":50,"column":12},"action":"insert","lines":["l"]}]}],[{"group":"doc","deltas":[{"start":{"row":50,"column":12},"end":{"row":50,"column":13},"action":"insert","lines":["o"]}]}],[{"group":"doc","deltas":[{"start":{"row":50,"column":13},"end":{"row":50,"column":14},"action":"insert","lines":["g"]}]}],[{"group":"doc","deltas":[{"start":{"row":50,"column":15},"end":{"row":51,"column":0},"action":"insert","lines":["",""]},{"start":{"row":51,"column":0},"end":{"row":51,"column":1},"action":"insert","lines":["\t"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":1},"end":{"row":51,"column":2},"action":"insert","lines":["\t"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":2},"end":{"row":51,"column":3},"action":"insert","lines":["l"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":3},"end":{"row":51,"column":4},"action":"insert","lines":["o"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":4},"end":{"row":51,"column":5},"action":"insert","lines":["g"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":5},"end":{"row":51,"column":7},"action":"insert","lines":["()"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":6},"end":{"row":51,"column":7},"action":"insert","lines":["t"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":7},"end":{"row":51,"column":8},"action":"insert","lines":["h"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":8},"end":{"row":51,"column":9},"action":"insert","lines":["i"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":9},"end":{"row":51,"column":10},"action":"insert","lines":["s"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":10},"end":{"row":51,"column":11},"action":"insert","lines":["."]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":11},"end":{"row":51,"column":12},"action":"insert","lines":["$"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":12},"end":{"row":51,"column":13},"action":"insert","lines":["$"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":13},"end":{"row":51,"column":14},"action":"insert","lines":["n"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":14},"end":{"row":51,"column":15},"action":"insert","lines":["a"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":11},"end":{"row":51,"column":15},"action":"remove","lines":["$$na"]},{"start":{"row":51,"column":11},"end":{"row":51,"column":17},"action":"insert","lines":["$$name"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":17},"end":{"row":51,"column":18},"action":"insert","lines":[","]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":18},"end":{"row":51,"column":19},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":19},"end":{"row":51,"column":20},"action":"insert","lines":["v"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":20},"end":{"row":51,"column":21},"action":"insert","lines":["a"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":21},"end":{"row":51,"column":22},"action":"insert","lines":["l"]}]}],[{"group":"doc","deltas":[{"start":{"row":51,"column":23},"end":{"row":51,"column":24},"action":"insert","lines":[";"]}]}],[{"group":"doc","deltas":[{"start":{"row":46,"column":47},"end":{"row":47,"column":0},"action":"insert","lines":["",""]},{"start":{"row":47,"column":0},"end":{"row":47,"column":4},"action":"insert","lines":["    "]}]}],[{"group":"doc","deltas":[{"start":{"row":47,"column":4},"end":{"row":47,"column":5},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":47,"column":5},"end":{"row":47,"column":6},"action":"insert","lines":["e"]}]}],[{"group":"doc","deltas":[{"start":{"row":47,"column":6},"end":{"row":47,"column":7},"action":"insert","lines":["t"]}]}],[{"group":"doc","deltas":[{"start":{"row":47,"column":7},"end":{"row":47,"column":8},"action":"insert","lines":["u"]}]}],[{"group":"doc","deltas":[{"start":{"row":47,"column":8},"end":{"row":47,"column":9},"action":"insert","lines":["r"]}]}],[{"group":"doc","deltas":[{"start":{"row":47,"column":9},"end":{"row":47,"column":10},"action":"insert","lines":["n"]}]}],[{"group":"doc","deltas":[{"start":{"row":47,"column":10},"end":{"row":47,"column":11},"action":"insert","lines":[" "]}]}],[{"group":"doc","deltas":[{"start":{"row":47,"column":11},"end":{"row":47,"column":12},"action":"insert","lines":["t"]}]}],[{"group":"doc","deltas":[{"start":{"row":47,"column":12},"end":{"row":47,"column":13},"action":"insert","lines":["h"]}]}],[{"group":"doc","deltas":[{"start":{"row":47,"column":13},"end":{"row":47,"column":14},"action":"insert","lines":["i"]}]}],[{"group":"doc","deltas":[{"start":{"row":47,"column":14},"end":{"row":47,"column":15},"action":"insert","lines":["s"]}]}],[{"group":"doc","deltas":[{"start":{"row":47,"column":15},"end":{"row":47,"column":16},"action":"insert","lines":[";"]}]}]]},"timestamp":1425290475000}