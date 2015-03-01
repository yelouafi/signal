var _ = require("./static.js"),
	neant = require('./neant.js');


function EventHelper() { 
	this.slots = [];
}

EventHelper.prototype.on = function(slot) {
    _.add(this.slots, slot, true); 
};

EventHelper.prototype.off = function(slot) { 
    _.remove(this.slots, slot); 
};

EventHelper.prototype.emit = function (data) { 
	_.each( 
	    this.slots, 
	    _.callw( data )
    ); 
};


function log(prefix, val) {
    console.log(prefix + ':' + val);
}

function Signal() {
    this.$$currentValue = arguments.length ? arguments[0] : neant,
	this.$$discrete = ( this.currentValue === neant ),
	this.$$valueEvent = new EventHelper(),
	this.$$log = false;
	this.$$name = 'anonym';
	this.$$sources = [];
	this.$$deps = [];
}



Signal.prototype.name = function(name) {
    this.$$name = name;
    return this;
}

Signal.prototype.log = function(log) {
    this.$$log = arguments.length ? log : true;
}

Signal.prototype.$$emit = function(val) {
	this.$$valueEvent.emit(val);
	if( !this.$$discrete )
		this.$$currentValue = val;
}

Signal.prototype.on = function(listener) {
    this.$$valueEvent.on(listener);
}

Signal.prototype.off = function(listener) {
    this.$$valueEvent.off(listener);
}

Signal.prototype.activate = Signal.prototype.deactivate = function() {}

module.exports = Signal;