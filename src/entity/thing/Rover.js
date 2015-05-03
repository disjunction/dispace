var cc = require('cc'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing;

var Rover = Thing.extend({
    ctor: function(opts) {
        if (!opts.assembly) {
            throw new Error('Rover requires "assembly" opt');
        }
        this.type = 'rover';
        Thing.prototype.ctor.call(this, opts);
        
        this.things = {}

        // create alias
        this.assembly = opts.assembly;
    }
});

module.exports = Rover;