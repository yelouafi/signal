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
	for(var i = 0, len = this.slots.length; i < len; i++ ) {
		this.slots[i](data);
	}
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
	this.$$todos = [];
}



Signal.prototype.name = function(name) {
    this.$$name = name;
    return this;
}

Signal.prototype.log = function(log) {
    this.$$name = log;
    this.$$log = true;
    return this;
}

Signal.prototype.$$execTodos = function(v) {
    for(var i = 0, len = this.$$todos.length; i < len; i++) {
    	this.$$todos[i](v);
    }
}

Signal.prototype.$$emit = function(val) {
	if(this.$$log)
		log(this.$$name, val);
	if( !this.$$discrete )
		this.$$currentValue = val;
	this.$$valueEvent.emit(val);
	this.$$execTodos(val);
}

Signal.prototype.on = function(listener) {
    this.$$valueEvent.on(listener);
    return this;
}

Signal.prototype.off = function(listener) {
    this.$$valueEvent.off(listener);
    return this;
}

Signal.prototype.tap = function(proc) {
    _.add(this.$$todos, proc, true);
    if(this.$$currentValue !== neant)
        proc(this.$$currentValue);
    return this;
}

Signal.prototype.tapOff = function(proc) {
    _.remove(this.$$todos, proc);
    return this;
}

Signal.prototype.activate = function() {}
Signal.prototype.deactivate = function() {}

module.exports = Signal;