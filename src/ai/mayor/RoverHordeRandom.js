/*jslint node: true */
"use strict";

var cc = require('cc'),
    flame = require('fgtk/flame'),
    core = flame.rof.core;

var RoverHordeRandom = cc.Class.extend({
    ctor: function(opts) {
        this.opts = opts;
        this.things = [];
    }
});

var _p = RoverHordeRandom.prototype;

_p.push = function(thing) {
    this.things.push(thing);
};

_p.randomizeInterstate = function(value) {
    function randomizeInteractor(thing) {
        var i = thing.i;
        if (Math.random() < 0.2) {
            i[core.ACCELERATE] = true;
        } else {
            delete i[core.ACCELERATE];
        }
        if (Math.random() < 0.2) {
            if (Math.random() < 0.2) {
                i[core.TURN_LEFT] = true;
            } else if (Math.random() < 0.4) {
                i[core.TURN_RIGHT] = true;
            } else {
                delete i[core.TURN_LEFT];
                delete i[core.TURN_RIGHT];
            }
        }

        if (thing.c && thing.c.turret1) {
            if (Math.random() < 0.2) {
                //thing.c.turret1.mode = 'charge';
            } else {
                thing.c.turret1.mode = 'none';
            }
        }
    }

    for (var i = 0; i < this.things.length; i++) {
        var thing = this.things[i];
        if (!thing.avatar && Math.random() < 0.05) {
            randomizeInteractor(thing);
        }
    }
};

module.exports = RoverHordeRandom;
