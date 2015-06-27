/*jslint node: true */
"use strict";

var cc = require('cc'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    Field = flame.entity.Field,
    smog = require('fgtk/smog'),
    grass = require('fgtk/grass'),
    ModuleDispaceEngine = require('dispace/field/ModuleDispaceEngine'),
    ModuleShooter = require('dispace/field/ModuleShooter'),
    ModuleWillMaster = require('dispace/field/ModuleWillMaster'),
    ModuleRof = require('dispace/field/ModuleRof'),
    ThingSerializer = flame.service.ThingBuilder,
    GutsManager = require('dispace/service/GutsManager'),
    RoverBuilder = require('dispace/service/RoverBuilder'),
    ItemManager = require('dispace/service/ItemManager'),
    FieldSerializer = flame.service.serialize.FieldSerializer,
    DispaceThingSerializer = require('dispace/service/serialize/DispaceThingSerializer');

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

    this.gutsManager = new GutsManager({});
    this.thingBuilder = new flame.service.ThingBuilder();
    this.itemManager = new ItemManager({
        cosmosManager: this.cosmosManager
    });
    this.roverBuilder = new RoverBuilder({
        itemManager: this.itemManager,
        thingBuilder: this.thingBuilder,
        gutsManager: this.gutsManager
    });
}

var _p = Bootstrap.prototype;

_p.makeFieldSerializer = function() {
    var serializer =  new FieldSerializer({
        thingSerializer: new DispaceThingSerializer({
            cosmosManager: this.cosmosManager,
            thingBuilder: this.thingBuilder,
            roverBuilder: this.roverBuilder
        })
    });
    return serializer;
};

_p.makeBasicFe = function(opts) {
    opts = opts || {};

    var pumpkin = grass.pumpkin.Pumpkin.bootstrapLocal();

    this.fe = new flame.engine.FieldEngine({
        cosmosManager: this.cosmosManager,
        assetManager: this.assetManager,
        config: this.config,
        thingBuilder: this.thingBuilder,
        roverBuilder: this.roverBuilder,
        itemManager: this.itemManager,
        gutsManager: this.gutsManager,
        uidGenerator: new smog.util.UidGenerator(opts.uidPrefix || 'f'),
        pumpkin: pumpkin,
        pumpkinClient: pumpkin.makeClient()
    });

    this.fe.registerModule(new flame.engine.ModuleBox2d({
        cosmosManager: this.cosmosManager,
        assetManager: this.assetManager,
        config: this.config
    }), 'b');
    this.world = this.fe.m.b.makeWorld();

    this.fe.registerModule(new ModuleDispaceEngine({
    }), 'de');

    this.fe.registerModule(new ModuleRof({
    }), 'rof');

    this.fe.registerModule(new ModuleWillMaster({
    }), 'willMaster');

    return this.fe;
};

_p.makeServer = function(opts) {
    var fe = this.makeBasicFe();

    fe.registerModule(new ModuleShooter({
    }), 'shooter');

    return fe;
};

module.exports = Bootstrap;
