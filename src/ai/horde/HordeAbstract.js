/*jslint node: true */
"use strict";

var cc = require('cc'),
    smog = require('fgtk/smog'),
    SchedulingQueue = smog.util.SchedulingQueue,
    Behavior = require('dispace/ai/Behavior');

/**
 * opts:
 * * fe
 * * plan
 * * name
 *
 * optional methods:
 * * captureThing
 */
var HordeAbstract = cc.Class.extend({
    ctor: function(opts) {
        this.opts = opts;
        this.things = [];
        this.behaveQueue = new SchedulingQueue();
    },

    registerMayor: function(mayor) {
        this.mayor = mayor;
        this.scheduleNextStep();
    },

    pushThing: function(thing) {
        this.things.push(thing);
        this.behaveQueue.schedule(0, new Behavior(thing, ["think"]));
    },

    removeThing: function(thing) {
        var index = this.things.indexOf(thing);
        if (index >= 0) {
            this.things.splice(index, 1);
        }
    },

    spawn: function(thing) {
        thing.ai = true;
        thing.horde = this;
        thing.l = this.findSpawnPoint(thing);

        this.pushThing(thing);

        this.fe.injectThing(thing);

        this.fe.dispatchTeff(
            thing,
            ["+spawn", "+inert", "+invuln"],
            1,
            ["-spawn", "-inert", "-invuln"]
        );

    },

    scheduleNextStep: function() {
        if (this.opts.plan.stepPeriod) {
            this.mayor.hordeQueue.schedule(this.opts.fe.simSum + this.opts.plan.stepPeriod, this);
        }
    },

    step: function(event) {
    }
});

module.exports = HordeAbstract;
