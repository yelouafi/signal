var _ = require("./base.js");

function Event() { 
	this.slots = []; 
}

Event.prototype.on = function(slot) {
    _.add(this.slots, slot, true); 
};

Event.prototype.off = function(slot) { 
    _.remove(this.slots, slot); 
};

Event.prototype.emit = function (data) { 
	_.each( 
	    this.slots, 
	    _.callw( data )
    ); 
};

module.exports = Event;