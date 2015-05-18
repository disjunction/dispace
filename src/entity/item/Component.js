var cc = require('cc'),
    Item = require('dispace/entity/item/Item');

var Component = Item.extend({
    ctor: function(opts) {
        this.type = 'component';
        Item.prototype.ctor.call(this, opts);
        if (!opts.subtype) {
            throw new Error('subtype is required for component Item');
        }

        // fieldEngine.timeSum when it was "shot" last time (in seconds)
        // set to negative because we want to start the field with all components "loaded"
        this.lastShot = -1000;

        // other most important mode is charge (which is normally equal to try to shot all the time ;))
        this.mode = "none";
    },

    setMark: function(mark) {
        if (isFinite(mark)) {
            mark = 'm' + mark;
        }
        if (!this.opts.params[mark]) {
            throw new Error('component ' + this.opts.name + ' has no mark: ' + mark);
        }
        this.params = this.opts.params[mark];
        if (this.params.omega) {
            this.params.omegaRad = this.params.omega / 180 * Math.PI;
        }
    }
});

Component.subtypes = [
    'hull',
    'turret',
    'engine'
];

module.exports = Component;
