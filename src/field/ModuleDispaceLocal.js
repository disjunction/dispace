/*jslint node: true */
"use strict";

var b2 = require('jsbox2d'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract'),
    ViewponAbstract = require('view/viewpon/ViewponAbstract');

var radius;

/**
 * opts:
 * * gutsManager
 */
var ModuleDispaceLocal = ModuleAbstract.extend({
    injectFe: function(fe, name) {
        this.di = 0; // dispace iteration
        this.importantThings = [];

        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        this.fe.fd.addListener('injectThing', function(event) {
            var thing = event.extra.thing;
            if (thing.type && thing.type == 'rover') {
                this.displayRover(thing);

                // store important for "us" things,
                // so that we iterate only through the relevant ones in poststep
                this.importantThings.push(thing);
            }
        }.bind(this));

        this.fe.fd.addListener('moveThing', function(event) {
            var thing = event.thing;
            if (thing.type && thing.type == 'rover') {
                this.stepAwakeRover(thing, event.dt);
            }
        }.bind(this));

        // mark start of the iteraction
        this.fe.fd.addListener('prestep', function(event) {
            this.di++;
        }.bind(this));

        // process things, which were not triggered by other events
        // this is done in a separate loop, to save double redraw on move and then rotate
        // these should be low-cost operations
        this.fe.fd.addListener('poststep', function(event) {
            for (var i = 0; i < this.importantThings.length; i++) {
                var thing = this.importantThings[i];
                if (thing.di != this.di) {
                    if (thing.type && thing.type == 'rover') {
                        this.stepSleepyRover(thing, event.dt);
                    }
                }
            }
        }.bind(this));

        this.fe.fd.addListener('injectShot', function(event) {
            this.displayShot(event);
        }.bind(this));

        this.fe.fd.addListener('injectHit', function(event) {
            this.injectHit(event);
        }.bind(this));
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

    getViewponForComponent: function(component) {
        if (!component.viewpon) {
            component.viewpon = new ViewponAbstract({
                fe: this.fe,
                viewponPlan: this.fe.opts.cosmosManager.getResource(component.opts.viewponSrc)
            });
        }
        return component.viewpon;
    },

    displayShot: function(event) {
        var viewpon = this.getViewponForComponent(event.shot.subjComponent);
        viewpon.showShot(event.shot);
    },

    displayHit: function(event) {
        var viewpon = this.getViewponForComponent(event.hit.subjComponent);
        viewpon.showHit(event.hit);
        this.fe.m.insight.displayDamage(event.hit);
    },

    displayRover: function(thing) {
        // alias for socket definition
        thing.sockets = thing.assembly.opts.components.hull.opts.sockets;

        for (var i in thing.things) {
            var subthing = thing.things[i];
            this.fe.m.c.envision(subthing);
        }

        this.stepAwakeRover(thing, 0);
    },

    rotateComponent: function(thing, dt) {
        if (!thing.aa) {
            thing.aa = 0;
        }
        thing.aa += thing.o * dt;
    },

    stepSubthing: function(thing, subthing, dt) {
        if (subthing.o) this.rotateComponent(subthing, dt);
        subthing.a = thing.a + subthing.aa;
        this.fe.m.c.syncStateFromThing(subthing);
    },

    stepComponent: function(thing, component, dt) {
        if (component.opts.subtype == 'turret') {
            if (component.mode == 'charge') {
                this.fe.m.shooter.attemptShoot(thing, component);
            }
        }
    },

    stepSleepyRover: function(rover, dt) {
        var i;
        for (i in rover.things) {
            this.stepSubthing(rover, rover.things[i], dt);
        }
        for (i in rover.c) { // step component
            this.stepComponent(rover, rover.c[i], dt);
        }
    },

    stepAwakeRover: function(rover, dt) {
        var cos = Math.cos(rover.a),
            sin = Math.sin(rover.a);
        rover.di = this.di;

        var i;
        for (i in rover.things) {
            var subthing = rover.things[i],
                radius = rover.sockets[i].radius;

            subthing.l.x = rover.l.x + radius * cos;
            subthing.l.y = rover.l.y + radius * sin;
            this.stepSubthing(rover, subthing, dt);

        }
        for (i in rover.c) { // step component
            this.stepComponent(rover, rover.c[i], dt);
        }
    }
});

module.exports = ModuleDispaceLocal;
