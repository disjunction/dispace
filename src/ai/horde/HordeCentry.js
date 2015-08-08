/*jslint node: true */
"use strict";

var cc = require('cc'),
    flame = require('fgtk/flame'),
    smog = require('fgtk/smog'),
    core = flame.rof.core,
    HordeDumby = require('./HordeDumby'),
    Behavior = require('dispace/ai/Behavior');


var turretIndexes = ["turret1", "turret2"];

var HordeCentry = HordeDumby.extend({

    ctor: function(opts) {
        this._super(opts);
    },

    think: function(thing) {
        turretIndexes.forEach(function(index) {
            if (!thing.c || !thing.c[index]) {
                return;
            }

            // here 1.5 is just an empiric coefficient
            var minPeriod = this.opts.plan.stepPeriod * this.things.length * 1.5;

            if (!this.checkFireLine(thing, thing.c[index])) {
                if (!this.rotateTurretToEnemy(thing, thing.c[index], minPeriod)) {
                    // here -1.5 means just "almost -PI", i.e. rotate clockwise as fast as you can
                    this.rotateTurret(thing, thing.c[index], -1.5);
                }
            }
        }.bind(this));

        this.behaveQueue.schedule(this.fe.simSum + this.opts.plan.stepPeriod, new Behavior(thing, ["think"]));
    },

    attemptSpawn: function() {
    },
});

module.exports = HordeCentry;
