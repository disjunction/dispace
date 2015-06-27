/*jslint node: true */
"use strict";

var b2 = require('jsbox2d'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract');

var radius;

/**
 * opts:
 * * gutsManager
 */
var ModuleDispaceLocal = ModuleAbstract.extend({


    registerEgo: function(ego) {
        this.ego = ego;
    },

    injectHit: function(event) {
        this.displayHit(event);


        if (event.hit.objThing.g) {
            var objThing = event.hit.objThing;
            this.opts.gutsManager.applyDamage(event.hit.damage, objThing.g);
            if (event.hit.affects) {
                for (var i = 0; i < event.hit.affects.length; i++) {
                    if (event.hit.affects[i] == 'explode') {
                        objThing.inert = true;
                        if (objThing.plan.states.explode) {
                            this.fe.m.c.changeState(objThing, 'explode');
                        }
                        if (objThing.things) {
                            for (var j in objThing.things) {
                                this.fe.m.c.removeThing(objThing.things[j]);
                            }
                            objThing.things = null;
                        }
                    }
                }
            }
        }
    },

});

module.exports = ModuleDispaceLocal;
