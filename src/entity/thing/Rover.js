

var cc = require('cc'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing;

var Rover = Thing.extend({
    ctor: function(opts) {
        if (!opts.assembly) {
            throw new Error('Rover requires "assembly" opt');
        }

        this.assembly = opts.assembly;
        this.things = {};
        this.type = opts.type || 'rover';

        this._super(opts);
    },

    isControlled: function() {
        return (!this.removed && !this.hasEffect('inert'));
    },

    isInvuln: function() {
        return (this.removed || this.hasEffect('invuln'));
    },
});

Rover.turretIndexes = ["turret1", "turret2"];

module.exports = Rover;
