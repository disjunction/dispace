/*jslint node: true */
"use strict";

var b2 = require('jsbox2d'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract'),
    ViewponAbstract = require('dispace/view/viewpon/ViewponAbstract'),
    ShotSerializer = require('dispace/service/serialize/ShotSerializer');

var radius;

var reusableEvents = {
    "gutsUpdate": {
        type: "gutsUpdate",
        thing: null
    },
};


/**
 * receives and allies messages from server
 * sends updates about ego to the server
 *
 * opts:
 */
var ModuleDispaceClient = ModuleAbstract.extend({
    injectFe: function(fe, name) {
        this.sibling = null;

        ModuleAbstract.prototype.injectFe.call(this, fe, name);


        this.shotSerializer = new ShotSerializer({
            fe: fe
        });

        this.addNativeListeners([
            "ownInterstate",
            "controlRover",
            "will",
        ]);

        this.thingSerializer = this.fe.opts.fieldSerializer.opts.thingSerializer;
        this.roverSerializer = this.thingSerializer.serializers.rover;
    },

    registerSibling: function(sibling) {
        this.sibling = sibling;
        this.fe.m.p.registerSibling(sibling);
    },

    registerEgo: function(ego) {
        this.ego = ego;
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
        this.fe.m.p.registerSibling(sibling);
    },

    onOwnInterstate: function(event) {
        var serializer = this.thingSerializer,
            interstateActivity = [
                "i",
                serializer.makeIterstateBundle(event.thing),
                serializer.outFloat(this.fe.simSum)
            ];
        this.sendActivity(interstateActivity);
    },

    onControlRover: function(event) {
        var bundle = {
            thingId: event.thing.id,
        };
        if (event.turret1) {
            bundle.turret1 = this.roverSerializer.makeTurretBundle(event.turret1);
        }
        if (event.turret2) {
            bundle.turret2 = this.roverSerializer.makeTurretBundle(event.turret2);
        }

        this.sendActivity(["w", [
            ["wa", "controlRover", bundle]
        ], 0]);
    },

    onWill: function(event) {
        this.sendActivity(["w", [
            ['wa', event.operation, event.params || null]
        ], 0]);
    },

    processFieldSocketEvent: function(event) {
        if (!Array.isArray(event)) {
            throw new Error('unexpected fieldSockwsswetEvent format. ' + typeof event);
        }

        switch (event[0]) {
            case 'iup': return this.applyIup(event);
            case 'pup': return this.applyPup(event);
            case 'rup': return this.applyRup(event);
            case 'fev': return this.applyFev(event);
            case 'things': return this.applyThings(event);
            case 'siblings': return this.applySiblings(event);
            case 'avatars': return this.applyAvatars(event);
            default:
                throw new Error('unknown fieldSocketEvent event. ' + event[0]);
        }
    },

    applyIup: function(event) {
        var serializer = this.thingSerializer;
        for (var i = 0; i < event[1].length; i++) {
            var thing = this.fe.thingMap[event[1][i][0]];
            if (!thing || thing.removed) {
                continue;
            }
            if (thing == this.ego) {
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
        var serializer = this.thingSerializer;
        for (var i = 0; i < event[1].length; i++) {
            var thing = this.fe.thingMap[event[1][i][0]];
            if (!thing) {
                continue;
            }

            thing.pup = event[1][i][1];
        }
        this.fe.simAccumulator = 0;
        this.fe.stats.simDiff = this.fe.simSum - event[2];
        this.fe.simSum = event[2];
    },

    applyRup: function(event) {
        var serializer = this.thingSerializer,
            thing, thingId;

        function applyTurret(name, bundle) {
            var turretThing = thing.c[name].thing;
            turretThing.aa = bundle[0];
            turretThing.o = bundle[1];
        }

        for (var i = 0; i < event[1].length; i++) {
            thingId = event[1][i][0];
            if (this.ego && this.ego.id == thingId) {
                continue;
            }
            thing = this.fe.thingMap[thingId];
            var controlBundle = event[1][i][1];
            if (!thing) {
                continue;
            }
            if (controlBundle.t1) {
                applyTurret('turret1', controlBundle.t1);
            }
            if (controlBundle.t2) {
                applyTurret('turret2', controlBundle.t2);
            }
        }
    },

    /**
     * event:
     * ["fev",
     *    ["shot", [serializedShot]],
     *    ["gup", [thingId, [serializedGuts]]]
     *    ...
     * ]
     */
    applyFev: function(event) {

        var events = event[1];
        for (var i = 0; i < events.length; i++) {
            var payload = events[i][1],
                thing;
            switch (events[i][0]) {
                case "proxy":
                    this.fe.fd.dispatch(events[i][1]);
                    break;
                case "shot":
                    this.fe.fd.dispatch({
                        type: "shot",
                        shot: this.shotSerializer.unserializeShot(payload)
                    });
                    break;
                case "hit":
                    this.fe.fd.dispatch({
                        type: "hit",
                        hit: this.shotSerializer.unserializeHit(payload)
                    });
                    break;
                case "teff":
                    thing = this.fe.thingMap[payload[0]];
                    if (thing) {
                        this.fe.fd.dispatch({
                            type: "teff",
                            thing: thing,
                            teff: payload[1]
                        });
                    } else {
                        console.warn('unknown thing while unserializing teff: ' + payload[1]);
                    }
                    break;
                case "gup":
                    thing = this.fe.thingMap[payload[0]];
                    thing.g = payload[1];
                    reusableEvents.gutsUpdate.thing = thing;
                    this.fe.fd.dispatch(reusableEvents.gutsUpdate);
                    break;
                default:
                    throw new Error("unknown fev: " + events[i][0]);
            }
        }
    },

    /**
     * Sample things message:bash
     * ["things",
     *     ["mA", "inject", {p: [...], "i": ...}]
     *     ["mB", "remove"]
     * ]
     */
    applyThings: function(event) {
        var serializer = this.thingSerializer;
        for (var i = 0; i < event[1].length; i++) {
            var thingId = event[1][i][0],
                operation = event[1][i][1],
                payload = event[1][i][2];
            switch (operation) {
                case "inject":
                    if (this.fe.thingMap[thingId]) {
                        console.warn('thing ' + thingId + ' already exists. things.inject ignored');
                        continue;
                    }
                    var thing = serializer.unserializeInitial(event[1][i]);
                    this.fe.injectThing(thing);
                    break;
                case "remove":
                    if (!this.fe.thingMap[thingId]) {
                        console.warn('thing ' + thingId + ' not found. things.remove ignored');
                        continue;
                    }
                    this.fe.removeThing(this.fe.thingMap[thingId]);
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
