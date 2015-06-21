/*jslint node: true */
"use strict";

var b2 = require('jsbox2d'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract'),
    ViewponAbstract = require('dispace/view/viewpon/ViewponAbstract');

var radius;

/**
 * opts:
 * * gutsManager
 */
var ModuleDispaceClient = ModuleAbstract.extend({
    injectFe: function(fe, name) {
        this.sibling = null;
        this.thingMap = {};
        this.di = 0; // dispace iteration
        this.importantThings = [];

        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        this.fe.fd.addListener('injectThing', function(event) {
            var thing = event.thing;
            if (thing.id) {
                this.thingMap[thing.id] = thing;
            }

            if (thing.type && thing.type == 'rover') {
                this.displayRover(thing);

                // store important for "us" things,
                // so that we iterate only through the relevant ones in simStepEnd
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
        this.fe.fd.addListener('simStepCall', function(event) {
            this.di++;
        }.bind(this));

        // process things, which were not triggered by other events
        // this is done in a separate loop, to save double redraw on move and then rotate
        // these should be low-cost operations
        this.fe.fd.addListener('simStepEnd', function(event) {
            for (var i = 0; i < this.importantThings.length; i++) {
                var thing = this.importantThings[i];
                if (thing.di != this.di) {
                    if (thing.type && thing.type == 'rover') {
                        this.stepSleepyRover(thing, event.dt);
                    }
                }
            }
        }.bind(this));

        this.addNativeListeners([
            "injectShot",
            "injectHit",
            "ownInterstate"
        ]);
    },

    /**
     * event:
     * * sibling: serializedSibling
     */
    onRunScene: function(event) {
        var serializer = this.fe.opts.pumpkin.serializer,
            sibling = serializer.unserializeSibling(event.sibling);
        this.fe.injectSibling(sibling);
        this.sibling = sibling;
    },

    onOwnInterstate: function(event) {
        var serializer = this.fe.serializer.opts.thingSerializer,
            interstateActivity = [
                "i",
                serializer.makeIterstateBundle(event.thing),
                this.fe.simSum
            ];
        this.sendActivity(interstateActivity);
    },

    onInjectHit: function(event) {
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

    onInjectShot: function(event) {
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
    },

    processFieldSocketEvent: function(event) {
        if (!Array.isArray(event)) {
            throw new Error('unexpected fieldSocketEvent format. ' + typeof event);
        }

        switch (event[0]) {
            case 'pup': return this.applyPup(event);
            case 'iup': return this.applyIup(event);
            case 'things': return this.applyThings(event);
            case 'siblings': return this.applySiblings(event);
            case 'avatars': return this.applyAvatars(event);
            default:
                throw new Error('unknown fieldSocketEvent event. ' + event[0]);
        }
    },

    applyIup: function(event) {
        var serializer = this.fe.serializer.opts.thingSerializer;
        for (var i = 0; i < event[1].length; i++) {
            var thing = this.fe.thingMap[event[1][i][0]];
            if (!thing) {
                continue;
            }
            serializer.applyInterstateBundle(thing, event[1][i][1]);
            this.fe.fd.dispatch({
                type: 'interstate',
                thing: thing,
                interstate: thing.i
            });
        }
    },

    applyPup: function(event) {
        var serializer = this.fe.serializer.opts.thingSerializer;
        for (var i = 0; i < event[1].length; i++) {
            var thing = this.thingMap[event[1][i][0]];
            if (!thing) {
                continue;
            }

            thing.pup = event[1][i][1];
            //serializer.applyPhisicsBundleToBody(thing, event[1][i][1]);

        }
        this.fe.simAccumulator = 0;
        this.fe.stats.simDiff = this.fe.simSum - event[2];
        this.fe.simSum = event[2];
    },

    /**
     * Sample things message:bash
     * ["things",
     *     ["mA", "inject", {p: [...], "i": ...}]
     *     ["mB", "remove"]
     * ]
     */
    applyThings: function(event) {
        var serializer = this.fe.serializer.opts.thingSerializer;
        for (var i = 0; i < event[1].length; i++) {
            var thingId = event[1][i][0],
                operation = event[1][i][1],
                payload = event[1][i][2];
            switch (operation) {
                case "inject":
                    if (this.thingMap[thingId]) {
                        console.error('thing ' + thingId + ' already exists. things.inject ignored');
                        continue;
                    }
                    var thing = serializer.unserializeInitial(event[1][i]);
                    this.fe.injectThing(thing);
                    break;
                case "remove":
                    if (!this.thingMap[thingId]) {
                        console.error('thing ' + thingId + ' not found. things.remove ignored');
                        continue;
                    }
                    this.fe.removeThing(this.thingMap[thingId]);
                    break;
            }
        }
    },

    applySiblings: function(event) {
        var serializer = this.fe.opts.pumpkin.serializer;
        for (var i = 0; i < event[1].length; i++) {
            var siblingId = event[1][i][0],
                operation = event[1][i][1],
                payload = event[1][i][2];
            switch (operation) {
                case "inject":
                    var sibling = serializer.unserializeSibling(payload);
                    this.fe.injectSibling(sibling);
                    break;
                default:
                    throw new Error('unsupported opertation in applySiblings: ' + operation);
            }
        }
    },

    applyAvatars: function(event) {
        for (var i = 0; i < event[1].length; i++) {
            var siblingId = event[1][i][0],
                operation = event[1][i][1],
                payload = event[1][i][2];
            switch (operation) {
                case "inject":
                    var sibling = this.fe.siblingMap[payload.siblingId],
                        thing = this.fe.thingMap[payload.thingId];
                    if (!sibling) {
                        throw new Error('sibling not found while injecting avatar: ' + payload.siblingId);
                    }
                    if (!thing) {
                        throw new Error('thing not found while injecting avatar: ' + payload.thingId);
                    }
                    var avatar = new flame.entity.Avatar({
                        thing: thing,
                        sibling: sibling
                    });
                    this.fe.injectAvatar(avatar);
                    break;
                default:
                    throw new Error('unsupported opertation in applySiblings: ' + operation);
            }
        }
    },

    setSocket: function(socket) {
        this.socket = socket;
    },
    sendActivity: function(payload) {
        if (!this.socket) {
            throw new Error('socket not set while sending activity');
        }
        this.socket.emit('a', payload);
    },
});

module.exports = ModuleDispaceClient;
