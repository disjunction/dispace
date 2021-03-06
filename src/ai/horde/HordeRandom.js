/*jslint node: true */
"use strict";

var cc = require('cc'),
    HordeAbstract = require('./HordeAbstract'),
    flame = require('fgtk/flame'),
    core = flame.rof.core;

/**
 * opts:
 * * fe
 */
var HordeRandom = HordeAbstract.extend({
    step: function(event) {
        this.randomizeInterstate();
        this.scheduleNextStep();
    },

    captureThing: function(thing) {
        this.pushThing(thing);
        return true;
    },
});

var _p = HordeRandom.prototype;


_p.randomizeInterstate = function(value) {
    var me = this;

    function randomizeInteractor(thing) {
        var i = thing.i;

        i.set(core.ACCELERATE, (Math.random() < 0.2));

        if (Math.random() < 0.2) {
            if (Math.random() < 0.2) {
                i.set(core.TURN_LEFT, true);
            } else if (Math.random() < 0.4) {
                i.set(core.TURN_RIGHT, true);
            } else {
                i.set(core.TURN_LEFT, false);
                i.set(core.TURN_RIGHT, false);
            }
        }

        if (thing.c && thing.c.turret1) {
            if (Math.random() < 0.2) {
                //thing.c.turret1.mode = 'charge';
            } else {
                thing.c.turret1.mode = 'none';
            }
        }

        if (i.changed) {
            var proxyEvent = {
                thing: thing,
                interstate: i
            };
            i.changed = false;
            me.opts.fe.eq.channel("interstate").broadcast(proxyEvent);
        }
    }

    for (var i = 0; i < this.things.length; i++) {
        var thing = this.things[i];
        if (!thing.avatar && Math.random() < 0.05) {
            randomizeInteractor(thing);
        }
    }
};

module.exports = HordeRandom;
