/*jslint node: true */
"use strict";

var cc = require('cc'),
    smog = require('fgtk/smog'),
    b2 = require('jsbox2d'),
    flame = require('fgtk/flame'),
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract'),
    Driver = flame.rof.Driver,
    core = flame.rof.core,
    MoverConfigBuilder = require('dispace/service/MoverConfigBuilder');

/**
 * should be added somewhere in the end of init
 */
var ModuleRof = ModuleAbstract.extend({
    injectFe: function(fe, name) {
        this.rovers = [];

        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        this.driver = new Driver({
            world: this.fe.m.b.world
        });

        this.moverConfigBuilder = new MoverConfigBuilder();

        this.fe.fd.addListener('injectThing', function(event) {
            var thing = event.thing;
            if (thing.type && thing.type == 'rover') {
                this.injectThing(thing);
                this.rovers.push(thing);
            }
        }.bind(this));

        this.fe.fd.addListener('simStepCall', function(event) {
            this.driveAll();
        }.bind(this));

        this.fe.fd.addListener('removeThing', function(event) {
            if (!event.thing.mover || event.thing.inert) return;
            smog.util.util.removeOneFromArray(event.thing, this.rovers);
        }.bind(this));
    },

    injectThing: function(thing) {
        try {
            var moverConfig = this.moverConfigBuilder.makeByAssembly(thing.assembly);
            thing.mover = this.driver.makeMover(thing, moverConfig);
        } catch (e) {
            console.error('ModuleRof failed to injectThing: ' + thing.id);
        }
    },

    driveAll: function() {
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

            if (Math.random() < 0.2) {
                //thing.c.turret1.mode = 'charge';
            }
        }

        for (var i = 0; i < this.rovers.length; i++) {
            var thing = this.rovers[i];
            this.driver.drive(thing);
            if (!thing.player && Math.random() < 0.05) {
                if (this.opts.randomMove) {
                    //randomizeInteractor(thing);
                }
            }
        }
    }
});

module.exports = ModuleRof;
