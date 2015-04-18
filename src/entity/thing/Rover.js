var cc = require('cc'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing;

var Rover = Thing.extend({
    ctor: function(opts) {
        this.type = 'rover';
        Thing.prototype.ctor.call(this, opts);
        if (!opts.assembly) {
            throw new Error('Rover requires "assembly" opt');
        }
    }
});

module.exports = Rover;