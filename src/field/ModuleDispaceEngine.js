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
            "moveThing",
            "simStepCall",
            "simStepEnd",
            "hit",
            "shot",
        ]);
    },

    onInjectThing: function(event) {
        var thing = event.thing;
        if (thing.type && thing.type == 'rover') {
            // store important for "us" things,
            // so that we iterate only through the relevant ones in simStepEnd
            this.importantThings.push(thing);
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

    stepSubthing: function(thing, subthing, dt) {
        if (subthing.o) this.rotateComponent(subthing, dt);
        subthing.a = thing.a + subthing.aa;
        //this.fe.m.c.syncStateFromThing(subthing);
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

        var i;
        for (i in rover.things) {
            var subthing = rover.things[i],
                radius = rover.sockets[i].radius;

            subthing.l.x = rover.l.x + radius * cos;
            subthing.l.y = rover.l.y + radius * sin;
            this.stepSubthing(rover, subthing, dt);
        }
    },

    stepSleepyRover: function(rover, dt) {
        for (var i in rover.things) {
            this.stepSubthing(rover, rover.things[i], dt);
        }
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

        // push the subjThing in the direction opposit to shot
        if (subjThing && subjThing.body && subjComponent && subjComponent.params.recoil) {
            var turretThing = subjComponent.thing,
                recoilForce = geo.vector(subjComponent.params.recoil, turretThing.a + geo.PI);
            subjThing.body.ApplyForce(recoilForce, turretThing.l, true);
        }
    }
});

module.exports = ModuleDispaceEngine;
