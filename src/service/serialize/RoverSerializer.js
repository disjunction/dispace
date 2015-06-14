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
 *
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
        return bundle;
    },

    applyGutsBundle: function(thing, bundle) {
        thing.g = bundle[2].g;
    },

    unserializeInitial: function(bundle) {
        var rb = this.opts.roverBuilder,
            assembly = rb.makeAssembly(bundle[2].assemblyPlan),
            rover = rb.makeRover(assembly);
        this.applyGutsBundle(rover, bundle);
        this.applyPhisicsBundleToThing(rover, bundle[2].p);
        rover.id = bundle[0];
        return rover;
    }
});

var _p = RoverSerializer.prototype;

module.exports = RoverSerializer;
