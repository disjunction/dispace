/*jslint node: true */
"use strict";

var flame = require('fgtk/flame'),
    ThingSerializer = flame.service.serialize.ThingSerializer;

/**
 * Delegates Serialization/Unserialization to serializers depending on thing.type
 *
 *  Additional rover bundles:
 *  "g": ["i": [5, 10], "a": [7, 20]], // guts object is passed as is
 *
 *  Interstate bund
 *  "i": ["a", "l"], // in this example "accelerate" and "turn left"
 *  "s": "spawn" // current state
 *  "assemblyPlan": {"components": ... }, // custom assembly spec. passed as is, because is needed only when a new rover is added
 *  "assemblyPlanSrc": "assembly/mob/evil_guy", // (not yet implemented) predefined assembly, referenced just by src
 *
 */
var RoverSerializer = ThingSerializer.extend({
    ctor: function(opts) {
        ThingSerializer.prototype.ctor.call(this, opts);
    },

    serializeInitial: function(thing) {
        var bundle = ThingSerializer.prototype.serializeInitial.call(this, thing);
        bundle[2].assemblyPlan = thing.assembly.opts.plan;
        bundle[2].g = thing.g;
        if (thing.s) {
            bundle[2].s = thing.s;
        }
        return bundle;
    },

    makeTurretBundle: function(turretThing) {
        return [
            this.outAngle(turretThing.aa),
            this.outVelocity(turretThing.o)
        ];
    },

    applyGutsBundle: function(thing, bundle) {
        thing.g = bundle[2].g;
    },

    unserializeInitial: function(bundle) {
        var rb = this.opts.roverBuilder,
            payload = bundle[2],
            assembly = rb.makeAssembly(payload.assemblyPlan),
            rover = rb.makeRover(assembly);
        this.applyGutsBundle(rover, bundle);
        this.applyPhisicsBundleToThing(rover, payload.p);
        rover.id = bundle[0];
        if (payload.s) {
            rover.s = payload.s;
        }
        return rover;
    }
});

var _p = RoverSerializer.prototype;

module.exports = RoverSerializer;
