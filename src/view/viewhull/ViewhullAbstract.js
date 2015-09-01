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
        this.lookBuilder = this.opts.fe.m.c.opts.lookBuilder;
        this.moduleCocos = this.opts.fe.m.c;
    },

    explode: function(thing) {
        if (thing.plan.states.explode) {
            this.moduleCocos.changeLook(thing, 'explode');
        }
        if (thing.things) {
            for (var j in thing.things) {
                this.moduleCocos.removeThing(thing.things[j]);
            }
        }
        if (thing.look.nodes.gutsHud) {
            thing.look.nodes.gutsHud.runAction(cc.fadeTo(0.5, 0));
        }
    },

    spawn: function(thing) {
        var spawnPlan = this.cosmosManager.get('thing/effect/transition/spawn'),
            look = this.lookBuilder.makeLook(spawnPlan, 'spawn-sprite'),
            localL = cc.p(0, 0);
        this.moduleCocos.attachLookToContainerNode(look, thing, localL, 'effects');
    },

    // just a placeholder
    applyInterstate: function() {

    },

    onEnvision: function(thing) {

    }
});

module.exports = ViewhullAbstract;
