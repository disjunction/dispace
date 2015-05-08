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
        var distances = this.opts.viewponPlan.shot.distances;
        
        for (var i = 0; i < distances.length; i++) {
            var subplan = distances[i];
            if (distance >= subplan.distanceRange[0] && distance <= subplan.distanceRange[1]) {
                this.showShotBySubplan(shot, subplan);
                return;
            }
        }
        throw new Error('no distanceRange found for given params');
    },
    
    showShotBySubplan: function(shot, subplan) {
        var shotThing = this.makeThingBySubplan(subplan);
        this.opts.fe.injectThing(shotThing);
        Thing.stretch(shotThing, shot.l1, shot.l2);
        this.opts.fe.m.c.syncStateFromThing(shotThing);
    },
    
    makeThingBySubplan: function(subplan) {
        var thing = new Thing({
            plan: this.opts.fe.opts.cosmosManager.getResource(subplan.planSrc)
        });
        if (subplan.state) {
            thing.s = subplan.state;
        }        
        return thing;
    },
    
    showHit: function(hit) {
        var totalDamange = 0;
        for (var i in hit.damage) {
            totalDamange += hit.damage[i];
        }
        
        var damages = this.opts.viewponPlan.hit.damages;
        
        for (var i = 0; i < damages.length; i++) {
            var subplan = damages[i];
            if (totalDamange >= subplan.damageRange[0] && totalDamange <= subplan.damageRange[1]) {
                this.showHitBySubplan(hit, subplan);
                break;
            }
        }
    },
    
    showHitBySubplan: function(hit, subplan) {
        var hitThing = this.makeThingBySubplan(subplan);       
        
        // dynamic hit is only available for visible and embodied bodies ;)
        if (hit.objThing && hit.objThing.state && hit.objThing.body) {
            var state = this.opts.fe.m.c.opts.stateBuilder.makeState(hitThing.plan, hitThing.s),
                localL = hit.objThing.body.GetLocalPoint(hit.l);
            
            this.opts.fe.m.insight.attachStateToEffectContainer(state, hit.objThing, localL)
        } else {
            hitThing.l = hit.l;
            this.opts.fe.injectThing(hitThing);
        }
    },
    
    makeHitThing: function() {
        
    }
});

module.exports = ViewponAbstract;