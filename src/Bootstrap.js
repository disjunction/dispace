/*jslint node: true */
"use strict";

var cc = require('cc'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    Field = flame.entity.Field,
    geo = require('fgtk/smog').util.geo,
    GutsManager = require('dispace/service/GutsManager'),
    //ItemManager = require('dispace/service/ItemManager'),
    //RoverBuilder = require('dispace/service/RoverBuilder'),
    ModuleShooter = require('dispace/field/ModuleShooter'),
    ModuleRof = require('dispace/field/ModuleRof'),
    FieldSerializer = flame.service.serialize.FieldSerializer,
    ThingSerializer = flame.service.serialize.ThingSerializer;

/**
 * A factory for common bigger structures
 *
 * opts:
 * * cosmosManager
 * * assetManager
 * * config
 */
function Bootstrap(opts) {
    this.config = opts.config;
    this.cosmosManager = opts.cosmosManager;
    this.assetManager = opts.assetManager;
}

var _p = Bootstrap.prototype;

_p.makeFieldSerializer = function() {
    var serializer =  new FieldSerializer({
        thingSerializer: new ThingSerializer()
    });
    return serializer;
};

_p.makeBasicFe = function() {
    this.gutsManager = new GutsManager({
    });

    this.fe = new flame.engine.FieldEngine({
        cosmosManager: this.cosmosManager,
        assetManager: this.assetManager,
        config: this.config
    });

    this.fe.registerModule(new flame.engine.ModuleBox2d({
        cosmosManager: this.cosmosManager,
        assetManager: this.assetManager,
        config: this.config
    }), 'b');
    this.world = this.fe.m.b.makeWorld();

    this.fe.registerModule(new ModuleShooter({
    }), 'shooter');

    this.fe.registerModule(new ModuleRof({
    }), 'rof');

    return this.fe;
};

module.exports = Bootstrap;
