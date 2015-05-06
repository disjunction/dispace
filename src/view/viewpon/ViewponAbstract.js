var cc = require('cc'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing;

var ViewponAbstract = cc.Class.extend({
    /**
     * opts:
     * * fe
     * * viewponPlan
     * @returns {undefined}
     */
    ctor: function(opts) {
        this.opts = opts;
    },
    
    showShot: function(shot) {
        var distance = shot.subjComponent.params.range * shot.fraction;
        for (var i = 0; i < this.opts.viewponPlan.distances.length; i++) {
            var subplan = this.opts.viewponPlan.distances[i];
            if (distance >= subplan.distanceRange[0] && distance <= subplan.distanceRange[1]) {
                this.showShotBySubplan(shot, subplan);
                return;
            }
        }
        throw new Error('no distanceRange found for given params');
    },
    
    showShotBySubplan: function(shot, subplan) {
        var shotThing = this.makeShotThing(subplan);
        this.opts.fe.injectThing(shotThing);
        Thing.stretch(shotThing, shot.l1, shot.l2);
        this.opts.fe.m.c.syncStateFromThing(shotThing);
        globalShot = shotThing;
    },
    
    makeShotThing: function(subplan) {
        var thing = new Thing({
            plan: this.opts.fe.opts.cosmosManager.getResource(subplan.planSrc)
        });
        if (subplan.state) {
            thing.s = subplan.state;
        }        
        return thing;
    },
});

module.exports = ViewponAbstract;