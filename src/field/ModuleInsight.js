var b2 = require('jsbox2d'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract'),
    ViewponAbstract = require('view/viewpon/ViewponAbstract');

/**
 * reusable dummy plan
 * @type type
 */
var containerPlan = {
    type: 'container',
    layerId: 'stuff'
};

/**
 * opts:
 * * viewport
 * * stateBuilder
 * * config
 */
var ModuleInsight = ModuleAbstract.extend({
    getEffectContainer: function(thing) {
        if (!thing.state.nodes.effectContainer) {
            var container = this.fe.m.c.opts.viewport.opts.nb.makeNode(containerPlan);
            this.fe.m.c.opts.viewport.addNodeToLayer(container);
            thing.state.nodes.effectContainer = container;
        }
        return thing.state.nodes.effectContainer;
    },
    attachNodeToEffectContainer: function(node, thing, localL) {
        var effectContainer = this.getEffectContainer(thing);
        node.setPosition(cc.pMult(localL, this.fe.opts.config.ppm));
        effectContainer.addChild(node);
        this.fe.m.c.opts.viewport.applyAnimation(node);
    },
    attachStateToEffectContainer: function(state, thing, localL) {
        for (var i in state.nodes) {
            this.attachNodeToEffectContainer(state.nodes[i], thing, localL);
        }
    }
});

module.exports = ModuleInsight;