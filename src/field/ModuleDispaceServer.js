/*jslint node: true */
"use strict";

var b2 = require('jsbox2d'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract'),
    ViewponAbstract = require('dispace/view/viewpon/ViewponAbstract'),
    ShotSerializer = require('dispace/service/serialize/ShotSerializer');


var radius;

var broadcastedTypes = ['rover', 'obstacle'];

/**
 * opts:
 * * gutsManager
 * * fiueldSocketManager
 */
var ModuleDispaceServer = ModuleAbstract.extend({
    ctor: function(opts) {
        ModuleAbstract.prototype.ctor.call(this, opts);
        this.previous = {};

        this.shotSerializer = new ShotSerializer({
            fe: this.fe
        });

        // collects events in one simStep, so that it's sent as one message
        this.fevBuffer = [];

    },

    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        this.thingSerializer = this.fe.opts.fieldSerializer.opts.thingSerializer;
        this.roverSerializer = this.thingSerializer.serializers.rover;

        var myEvents = [
            "simStepEnd",
            "simEnd",
            "injectThing",
            "removeThing",
            "injectSibling",
            "injectAvatar",
            "interstate",
            "controlRover",
            "shot",
            "hit",
            "teff",
            "gutsUpdate",
            "injectQuest",
            "updateQuest",
            "alert",
        ];

       this.addNativeListeners(myEvents);
    },

    proxy: function(event) {
        this.fevBuffer.push([
            "proxy",
            event
        ]);
    },

    onSimStepEnd: function(event) {
        // fev is sent on simStepEnd to get the shots as fast as possible
        // to client side, but still as a single envelope with gup etc.
        var fieldSocketManager = this.opts.fieldSocketManager;
        if (this.fevBuffer.length > 0) {
            fieldSocketManager.broadcast([
                'fev',
                this.fevBuffer
            ]);
            this.fevBuffer = [];
        }
    },

    onSimEnd: function(event) {
        var fieldSocketManager = this.opts.fieldSocketManager,
            thingSerializer = this.thingSerializer,
            pup = [];
        for (var i = 0; i < this.fe.field.things.length; i++) {
            var thing = this.fe.field.things[i];
            if (thing.body && thing.body.IsAwake() && thing.plan && !thing.plan.static) {
                pup.push([thing.id, thingSerializer.makePhisicsBundle(thing)]);
            }
        }
        if (pup.length > 0) {
            fieldSocketManager.broadcast(['pup', pup, this.fe.simSum]);
        }
    },

    onInjectThing: function(event) {
        var thing = event.thing;
        if (!thing ||
            !thing.type ||
            broadcastedTypes.indexOf(thing.type) == -1) {
            return;
        }
        var fieldSocketManager = this.opts.fieldSocketManager,
            thingSerializer = this.thingSerializer,
            things = [thingSerializer.serializeInitial(thing)];
        fieldSocketManager.broadcast(['things', things]);
    },

    onRemoveThing: function(event) {
        var fieldSocketManager = this.opts.fieldSocketManager;
        fieldSocketManager.broadcast([
            'things', [
                [event.thing.id, 'remove']
            ]
        ]);
    },

    onInjectSibling: function(event) {
        var fieldSocketManager = this.opts.fieldSocketManager,
            sibling = event.sibling,
            serialSibling = this.fe.opts.pumpkin.serializer.serializeSibling(sibling),
            siblings = [[sibling.siblingId, "inject", serialSibling]];
        fieldSocketManager.broadcast(['siblings', siblings], true);
    },

    onInjectAvatar: function(event) {
        var avatarOpts = event.avatar.opts,
            avatarMessage = {
                thingId: avatarOpts.thing.id,
                siblingId: avatarOpts.sibling.siblingId
            },
            fieldSocketManager = this.opts.fieldSocketManager,
            avatars = [[avatarOpts.sibling.siblingId, "inject", avatarMessage]];
        fieldSocketManager.broadcast(['avatars', avatars]);
    },

    /**
     * event:
     * * thing
     * * i
     */
    onInterstate: function(event) {
        var fieldSocketManager = this.opts.fieldSocketManager,
            thingSerializer = this.thingSerializer;

        fieldSocketManager.broadcast([
            'iup',
            [[
                event.thing.id,
                thingSerializer.makeIterstateBundle(event.thing)
            ]],
            thingSerializer.outFloat(this.fe.simSum)
        ]);
    },

    /**
     * event:
     * * thing
     * * turret1: turret1 thing
     * * turret2: turret2 thing
     */
    onControlRover: function(event) {
        var fieldSocketManager = this.opts.fieldSocketManager,
            thingSerializer = this.thingSerializer,
            roverSerializer = this.roverSerializer;

        var rupBundle = {};
        if (event.turret1) {
            rupBundle.t1 = roverSerializer.makeTurretBundle(event.turret1);
        }
        if (event.turret2) {
            rupBundle.t2 = roverSerializer.makeTurretBundle(event.turret2);
        }

        fieldSocketManager.broadcast([
            'rup',
            [[
                event.thing.id,
                rupBundle
            ]],
            roverSerializer.outFloat(this.fe.simSum)
        ]);
    },

    onShot: function(event) {
        this.fevBuffer.push([
            "shot",
            this.shotSerializer.serializeShot(event)
        ]);
    },

    onHit: function(event) {
        this.fevBuffer.push([
            "hit",
            this.shotSerializer.serializeHit(event)
        ]);
    },

    /**
     * event:
     * * type: 'teff'
     * * thing: thing
     * * teff: ["+explode", "-shock"]
     */
    onTeff: function(event) {
        this.fevBuffer.push([
            "teff",
            [event.thing.id, event.teff]
        ]);
    },

    onGutsUpdate: function(event) {
        this.fevBuffer.push([
            "gup",
            [event.thing.id, event.thing.g]
        ]);
    },

    onInjectQuest: function(event) {
        this.proxy(event);
    },
    onUpdateQuest: function(event) {
        this.proxy(event);
    },
    onAlert: function(event) {
        this.proxy(event);
    },



});

module.exports = ModuleDispaceServer;
