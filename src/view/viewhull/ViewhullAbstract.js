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
        this.cosmosManager = this.opts.fe.opts.cosmosManager;
        this.stateBuilder = this.opts.fe.m.c.opts.stateBuilder;
        this.moduleCocos = this.opts.fe.m.c;


    },

    spawn: function(thing) {
        var spawnPlan = this.cosmosManager.get('thing/effect/transition/spawn'),
            state = this.stateBuilder.makeState(spawnPlan, 'spawn-sprite'),
            localL = cc.p(0, 0);
        this.moduleCocos.attachStateToContainerNode(state, thing, localL, 'effects');
    },

    // just a placeholder
    applyInterstate: function() {

    },

    onEnvision: function(thing) {

    }
});

module.exports = ViewhullAbstract;
