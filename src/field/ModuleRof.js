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

        this.addNativeListeners([
            "injectThing",
            "removeThing",
            "simStepCall"
        ]);
    },

    onInjectThing: function(event) {
        var thing = event.thing;
        if (thing.c && thing.c.hull && thing.c.hull.opts && thing.c.hull.opts.mover) {

            try {
                var moverConfig = this.moverConfigBuilder.makeByAssembly(thing.assembly);
                thing.mover = this.driver.makeMover(thing, moverConfig);
            } catch (e) {
                console.error('ModuleRof failed to injectThing: ' + thing.id);
                console.error(e);
            }

            this.rovers.push(thing);
        }
    },

    onRemoveThing: function(event) {
        if (!event.thing.mover || !event.thing.isControlled()) {
            return;
        }
        smog.util.util.removeOneFromArray(event.thing, this.rovers);
    },

    onSimStepCall: function(event) {

        for (var i = 0; i < this.rovers.length; i++) {
            var thing = this.rovers[i];
            this.driver.drive(thing);
        }
    }
});

module.exports = ModuleRof;
