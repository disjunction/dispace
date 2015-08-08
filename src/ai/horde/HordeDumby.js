/*jslint node: true */
"use strict";

var cc = require('cc'),
    flame = require('fgtk/flame'),
    smog = require('fgtk/smog'),
    Cospeak = smog.Cospeak,
    util = smog.util.util,
    core = flame.rof.core,
    HordeRandom = require('./HordeRandom'),
    Behavior = require('dispace/ai/Behavior');


var behavePatterns = {
    forward: [
        [1, "a"],
        [2, "a"],
        [1, "al"],
        [1, "ar"],
        [0.5, "r"],
        [0.5, "l"],
        [2, "al"],
        [2, "ar"]
    ],
    backward: [
        [1, "d"],
        [1, "dl"],
        [1, "dr"],
        [0.7, "r"],
        [0.7, "l"]
    ]
};

var turretIndexes = ["turret1", "turret2"];

/**
 * plan:
 * * stepPeriod
 * * spawnPeriod: rangedFloat
 * * maxThings
 * * assemblyPlanSrcList
 *
 * opts:
 * * plan
 * * fe
 * * name
 */
var HordeDumby = HordeRandom.extend({
    ctor: function(opts) {
        this._super(opts);

        this.currentIid = null;
        this.ray = new flame.engine.ray.RayClosestFilterFunction({
            filterFunction: function(thing) {
                if (thing.__instanceId == this.currentIid) {
                    return true;
                }
            }.bind(this)
        });

        var plan = opts.plan;

        this.maxThings = (plan.count === undefined) ? 10 : plan.count;

        this.lastSpawn = 0;

        if (!plan.assemblyPlanSrcList) {
            throw new Error('HordeDumby requires assemblyPlansSrcList');
        }

        this.size = Cospeak.readSize(plan.size) || {width: 10, height: 10};
        this.l = Cospeak.readPoint(plan.l);
        this.spawnPeriod = Cospeak.readRangedFloat(plan.spawnPeriod) || 3;

        this.cosmosManager = opts.fe.opts.cosmosManager;
        this.roverBuilder = opts.fe.opts.roverBuilder;

        this.assemblies = [];
        if (plan.assemblyPlanSrcList) {
            for (var i = 0; i < plan.assemblyPlanSrcList.length; i++) {
                var assemblyPlan = this.cosmosManager.get(plan.assemblyPlanSrcList[i]),
                    assembly = this.roverBuilder.makeAssembly(assemblyPlan);
                this.assemblies.push(assembly);
            }
        }
    },

    findSpawnPoint: function(thing) {
        return cc.p(this.l.x + Math.random() * this.size.width - this.size.width / 2,
                    this.l.y + Math.random() * this.size.height - this.size.height / 2);
    },

    removeThing: function(thing) {
        // if things are saturated, then we don't want to spawn instantly
        if (this.things.length == this.maxThings) {
            this.lastSpawn = this.fe.simSum;
        }

        this._super(thing);
    },

    attemptSpawn: function() {
        if (this.things.length >= this.maxThings) {
            return;
        }

        if (this.fe.simSum - this.lastSpawn < this.spawnPeriod) {
            return;
        }

        var thing = this.roverBuilder.makeRover(util.randomElement(this.assemblies));

        this.spawn(thing);

        this.lastSpawn = this.fe.simSum;
        // re-read from plan to make it more random
        this.spawnPeriod = Cospeak.readRangedFloat(this.opts.plan.spawnPeriod) || 3;
    },

    planRandom: function(thing, behaviorSet, behaviors) {
        var totalBehviors = Math.floor(Math.random() * 4) + 1;
        if (!behaviors) {
            behaviors = [];
        }
        for (var i = 0; i < totalBehviors; i++) {
            behaviors.push(util.randomElement(behaviorSet));
        }
        behaviors.push([0.3, []]);
        Behavior.pushInterstateStreak(this.behaveQueue, this.opts.fe.simSum, thing, behaviors, true);
    },

    think: function(thing) {
        this.currentIid = thing.__instanceId;
        this.fe.m.b.rayCastFromThing(this.ray, thing, 4, 0.5);
        if (this.ray.isHit) {
            this.planRandom(thing, behavePatterns.backward, [[0.5, ["d"]]]);
        } else {
            this.planRandom(thing, behavePatterns.forward);
        }

        turretIndexes.forEach(function(index) {
            if (thing.c && thing.c[index]) {
                this.checkFireLine(thing, thing.c[index]);
            }
        }.bind(this));
    },

    step: function(event) {
        this.attemptSpawn();

        var behavior = this.behaveQueue.fetch(this.opts.fe.simSum);
        if (behavior) {
            this.mayor.runBehavior(behavior);
        }

        this.scheduleNextStep();
    }
});

module.exports = HordeDumby;
