var cc = require('cc'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing;

/**
 * opts:
 * * fe
 */
var ViewhullAbstract = cc.Class.extend({
    ctor: function(opts) {
        this.opts = opts;
        this.stateBuilder = this.opts.fe.m.c.opts.stateBuilder;
    }
});

module.exports = ViewhullAbstract;
