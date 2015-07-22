/*jslint node: true */
"use strict";

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

        this.viewport = this.opts.fe.m.c.opts.viewport;
        this.assetManager = this.opts.fe.opts.assetManager;
    },

    showShot: function(shot) {
        var distance = shot.subjComponent.params.range * shot.fraction;
        var distances = this.opts.viewponPlan.shot.distances;

        // if the subcomponent is drawable + has shoot state
        if (shot.subjComponent.thing.plan.states && shot.subjComponent.thing.plan.states.shoot) {
            this.opts.fe.m.c.changeState(shot.subjComponent.thing, 'shoot');
        }

        for (var i = 0; i < distances.length; i++) {
            var subplan = distances[i];
            if (distance >= subplan.distanceRange[0] && distance <= subplan.distanceRange[1]) {
                this.showShotBySubplan(shot, subplan);
                if (!shot.isHit) {
                    this.playMissSound(shot.subjComponent.thing.l);
                }
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

    playMissSound: function(l) {
        var absoluteSrc = this.assetManager.resolveSrc('sound/generic/miss.wav');
        this.viewport.playLocalEffect(l, absoluteSrc);
    },
    playHitSound: function(l, totalDamage) {
        var soundSrc = 'sound/generic/boom1.wav';
        if (totalDamage > 50) {
            soundSrc = 'sound/generic/boom45.wav';
        } else if (totalDamage > 0) {
            soundSrc = 'sound/generic/boom23.wav';
        }
        var absoluteSrc = this.assetManager.resolveSrc(soundSrc);
        this.viewport.playLocalEffect(l, absoluteSrc);
    },

    showHit: function(hit) {
        var totalDamage = 0;
        for (var i in hit.damage) {
            totalDamage += hit.damage[i];
        }

        var damages = this.opts.viewponPlan.hit.damages;

        for (i = 0; i < damages.length; i++) {
            var subplan = damages[i];
            if (totalDamage >= subplan.damageRange[0] && totalDamage <= subplan.damageRange[1]) {
                this.showHitBySubplan(hit, subplan);
                this.playHitSound(hit.l, totalDamage);
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

            this.opts.fe.m.c.attachStateToContainerNode(state, hit.objThing, localL, 'effects');
        } else {
            hitThing.l = hit.l;
            this.opts.fe.injectThing(hitThing);
        }
    },

    makeHitThing: function() {

    }
});

module.exports = ViewponAbstract;
