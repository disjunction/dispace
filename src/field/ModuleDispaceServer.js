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
 * * socketManager
 */
var ModuleDispaceServer = ModuleAbstract.extend({
    ctor: function(opts) {
        ModuleAbstract.prototype.ctor.call(this, opts);
        this.previous = {};
    },

    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        this.fe.fd.addListener('simEnd', this.broadcastPup.bind(this));
    },

    broadcastPup: function(event) {
        var socketManager = this.opts.socketManager,
            thingSerializer = this.fe.serializer.opts.thingSerializer,
            pup = [];
        for (var i = 0; i < this.fe.field.things.length; i++) {
            var thing = this.fe.field.things[i];
            if (thing.body && thing.body.IsAwake() && thing.plan && !thing.plan.static) {
                pup.push([thing.id, thingSerializer.makePhisicsBundle(thing)]);
            }
        }
        if (pup.length > 0) {
            socketManager.broadcast(['pup', pup, this.fe.simSum]);
        }
    }
});

module.exports = ModuleDispaceServer;
