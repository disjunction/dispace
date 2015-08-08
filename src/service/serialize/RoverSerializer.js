/*jslint node: true */
"use strict";

var flame = require('fgtk/flame'),
    smog = require('fgtk/smog'),
    ThingSerializer = flame.service.serialize.ThingSerializer;

var turretMapping = {
    "turret1": "t1",
    "turret2": "t2",
};

var turretMappingReverse = {
    "t1": "turret1",
    "t2": "turret2",
};


/**
 * Delegates Serialization/Unserialization to serializers depending on thing.type
 *
 *  Additional rover bundles:
 *  "g": ["i": [5, 10], "a": [7, 20]], // guts object is passed as is
 *  "rup": {t1: [1, 2]. t2: [1.5, 3]} // same bundles as in dislex rup
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

        var rupBundle = this.makeRupBundle(thing);
        if (rupBundle) {
            bundle[2].rup = rupBundle;
        }

        return bundle;
    },

    makeRupBundle: function(thing) {
        var bundle = {},
            wasChanged = false;
        for (var i in turretMapping) {
            if (thing.c[i]) {
                bundle[turretMapping[i]] = this.makeTurretBundle(thing.c[i].thing);
                wasChanged = true;
            }
        }
        return wasChanged ? bundle : null;
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
        if (payload.rup) {
            for (var i in payload.rup) {
                var fullIndex = turretMappingReverse[i],
                    turret = rover.c[fullIndex].thing;
                turret.aa = payload.rup[i][0];
                turret.o = payload.rup[i][1];
            }
        }

        return rover;
    }
});

var _p = RoverSerializer.prototype;

module.exports = RoverSerializer;
