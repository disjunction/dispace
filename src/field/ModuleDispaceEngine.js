/*jslint node: true */
"use strict";

var flame = require('fgtk/flame'),
    smog = require('fgtk/smog'),
    geo = smog.util.geo,
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract');

/**
 * opts: none?
 */
var ModuleDispaceEngine = ModuleAbstract.extend({
    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        this.importantThings = [];

        this.di = 0; // dispace iteration

        this.addNativeListeners([
            "injectThing",
            "injectAvatar",
            "removeAvatar",
            "moveThing",
            "simStepCall",
            "simStepEnd",
            "hit",
            "shot",
            "teff",
        ]);
    },

    stepSubthing: function(thing, subthing, dt) {
        if (subthing.o) this.rotateComponent(subthing, dt);
        subthing.a = thing.a + subthing.aa;
    },


    rotateComponent: function(thing, dt) {
        if (!thing.aa) {
            thing.aa = 0;
        }
        thing.aa += thing.o * dt;
    },

    stepAwakeRover: function(rover, dt) {
        var cos = Math.cos(rover.a),
            sin = Math.sin(rover.a);
        rover.di = this.di;

        for (var i in rover.things) {
            var subthing = rover.things[i],
                pl = rover.sockets[i].pl;

            if (pl.f === 0) {
                subthing.l.x = rover.l.x + pl.r * cos;
                subthing.l.y = rover.l.y + pl.r * sin;
            } else {
                subthing.l.x = rover.l.x + pl.r * Math.cos(rover.a + pl.f);
                subthing.l.y = rover.l.y + pl.r * Math.sin(rover.a + pl.f);
            }
            this.stepSubthing(rover, subthing, dt);
        }
    },

    stepSleepyRover: function(rover, dt) {
        for (var i in rover.things) {
            this.stepSubthing(rover, rover.things[i], dt);
        }
    },

    onRemoveAvatar: function(event) {
        var avatar = event.avatar;
        avatar.opts.sibling.avatar = null;
        avatar.opts.thing.avatar = null;
    },

    onInjectThing: function(event) {
        var thing = event.thing;
        if (thing.type && thing.type == 'rover') {
            // store important for "us" things,
            // so that we iterate only through the relevant ones in simStepEnd
            this.importantThings.push(thing);

            // put subthings in place (dt = 0)
            this.stepAwakeRover(event.thing, 0);
        }
    },

    /**
     * creates cyclic links between sibling and thing through an avatar
     * event:
     * * avatar: flame.entity.Avatar
     */
    onInjectAvatar: function(event) {
        var avatar = event.avatar;
        avatar.opts.sibling.avatar = avatar;
        avatar.opts.thing.avatar = avatar;
    },

    onMoveThing: function(event) {
        var thing = event.thing;
        if (thing.type && thing.type == 'rover') {
            this.stepAwakeRover(thing, event.dt);
        }
    },

    // process things, which were not triggered by other events
    // this is done in a separate loop, to save double redraw on move and then rotate
    // these should be low-cost operations
    onSimStepEnd: function(event) {
        for (var i = 0; i < this.importantThings.length; i++) {
            var thing = this.importantThings[i];
            if (thing.di != this.di) {
                if (thing.type && thing.type == 'rover') {
                    this.stepSleepyRover(thing, event.dt);
                }
            }
        }
    },

    onSimStepCall: function(event) {
        // mark start of the iteraction
        this.di++;
    },

    onHit: function(event) {
        var objThing = event.hit.objThing,
            subjComponent = event.hit.subjComponent;
        if (objThing && objThing.g) {
            this.fe.opts.gutsManager.applyDamage(event.hit.damage, objThing.g);
        }

        // push the objThing in the direction of the shot
        if (subjComponent && objThing && objThing.body && subjComponent.params.impulse) {
            var turretThing = subjComponent.thing,
                impulseForce = geo.vector(subjComponent.params.impulse, turretThing.a);
            objThing.body.ApplyForce(impulseForce, event.hit.l, true);
        }
    },

    onShot: function(event) {
        var subjComponent = event.shot.subjComponent,
            subjThing = event.shot.subjThing;

        if (subjThing && !subjThing.removed) {

            if (event.shot.subjEnergy) {
                subjThing.g.e[0] = event.shot.subjEnergy;
            }

            // push the subjThing in the direction opposit to shot
            if (subjThing.body && subjComponent && subjComponent.params.recoil) {
                var turretThing = subjComponent.thing,
                    recoilForce = geo.vector(subjComponent.params.recoil, turretThing.a + geo.PI);
                subjThing.body.ApplyForce(recoilForce, turretThing.l, true);
            }
        }
    },

    onTeff: function(event) {
        if (event.thing && !event.thing.removed) {
            var teffs = Array.isArray(event.teff) ? event.teff : [event.teff];
            for (var i = 0; i < teffs.length; i++) {
                var effectString = teffs[i];
                if (event.thing.applyEffect(effectString)) {
                    this.fe.eq.channel("teffChange").broadcast({
                        thing: event.thing,
                        teff: effectString
                    });
                }
            }
        }
    },
});

module.exports = ModuleDispaceEngine;
