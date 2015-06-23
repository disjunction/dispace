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

_p.removeThing = function(thing) {
    var index = this.things.indexOf(thing);
    if (index >= 0) {
        this.things.splice(index, 1);
    }
};

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
                type: 'interstate',
                thing: thing,
                interstate: i
            };
            i.changed = false;
            me.opts.fe.fd.dispatch(proxyEvent);
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
