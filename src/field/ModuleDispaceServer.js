/*jslint node: true */
"use strict";

var b2 = require('jsbox2d'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract'),
    ViewponAbstract = require('dispace/view/viewpon/ViewponAbstract');

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
    },

    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        var myEvents = [
            "simEnd",
            "injectThing",
            "injectSibling",
            "injectAvatar",
            "interstate",
            "controlRover"
        ];

       this.addNativeListeners(myEvents);
    },

    onSimEnd: function(event) {
        var fieldSocketManager = this.opts.fieldSocketManager,
            thingSerializer = this.fe.serializer.opts.thingSerializer,
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
            thingSerializer = this.fe.serializer.opts.thingSerializer,
            things = [thingSerializer.serializeInitial(thing)];
        fieldSocketManager.broadcast(['things', things]);
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
            thingSerializer = this.fe.serializer.opts.thingSerializer;
        fieldSocketManager.broadcast([
            'iup',
            [[
                event.thing.id,
                thingSerializer.makeIterstateBundle(event.thing)
            ]],
            this.fe.simSum
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
            thingSerializer = this.fe.serializer.opts.thingSerializer,
            roverSerializer = this.fe.serializer.opts.thingSerializer.serializers.rover;

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
            this.fe.simSum
        ]);
    }
});

module.exports = ModuleDispaceServer;
