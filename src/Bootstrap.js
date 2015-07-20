/*jslint node: true */
"use strict";

var cc = require('cc'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    smog = require('fgtk/smog'),
    grass = require('fgtk/grass'),

    DispaceField = require('dispace/entity/DispaceField'),

    ThingSerializer = flame.service.ThingBuilder,
    GutsManager = require('dispace/service/GutsManager'),
    RoverBuilder = require('dispace/service/RoverBuilder'),
    ItemManager = require('dispace/service/ItemManager'),
    FieldSerializer = flame.service.serialize.FieldSerializer,
    FieldSocketManager = require('dispace/service/FieldSocketManager'),
    DispaceThingSerializer = require('dispace/service/serialize/DispaceThingSerializer'),
    FriendOrFoe = require('dispace/ai/FriendOrFoe'),


    ModuleDispaceClient = require('dispace/field/ModuleDispaceClient'),
    ModuleDispaceEngine = require('dispace/field/ModuleDispaceEngine'),
    ModuleDispaceServer = require('dispace/field/ModuleDispaceServer'),
    ModuleInsight = require('dispace/field/ModuleInsight'),
    ModuleMayor = require('dispace/field/ModuleMayor'),
    ModuleProtagonist = require('dispace/field/ModuleProtagonist'),
    ModuleQuestMaster = require('dispace/field/ModuleQuestMaster'),
    ModuleRof = require('dispace/field/ModuleRof'),
    ModuleServerStats = require('dispace/field/ModuleServerStats'),
    ModuleShooter = require('dispace/field/ModuleShooter'),
    ModuleWillMaster = require('dispace/field/ModuleWillMaster'),

    ModuleUi = require('dispace/ui/ModuleUi');

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

    var pumpkin = grass.pumpkin.Pumpkin.bootstrapLocal(),
        fieldSerializer = this.makeFieldSerializer();

    var fe = this.fe = new flame.engine.FieldEngine({
        cosmosManager: this.cosmosManager,
        assetManager: this.assetManager,
        config: this.config,
        thingBuilder: this.thingBuilder,
        roverBuilder: this.roverBuilder,
        itemManager: this.itemManager,
        gutsManager: this.gutsManager,
        uidGenerator: new smog.util.UidGenerator(opts.uidPrefix || 'f'),
        pumpkin: pumpkin,
        pumpkinClient: pumpkin.makeClient(),
        fieldSerializer: fieldSerializer,
        fof: new FriendOrFoe(),

        field: new DispaceField(),
    });

    fe.registerModule(new flame.engine.ModuleBox2d({
        cosmosManager: this.cosmosManager,
        assetManager: this.assetManager,
        config: this.config
    }), 'b');
    this.world = this.fe.m.b.makeWorld();

    fe.registerModule(new ModuleDispaceEngine({}), 'de');
    fe.registerModule(new ModuleRof({}), 'rof');
    fe.registerModule(new ModuleWillMaster({}), 'willMaster');

    return this.fe;
};

// master modules are the ones, which are not needed on client side,
// unlsess it's a local single playre mode
_p.registerMasterModules = function(opts) {
    var fe = this.fe;
    fe.registerModule(new ModuleShooter({}), 'shooter');
    fe.registerModule(new ModuleMayor({}), 'mayor');
    fe.registerModule(new ModuleQuestMaster({}), 'questMaster');
};

_p.makeServer = function(opts) {
    var fe = this.makeBasicFe();

    this.fieldSocketManager = new FieldSocketManager({
        fe: this.fe,
    });

    // server modules

    this.registerMasterModules(opts);

    this.fe.registerModule(new ModuleServerStats({
    }), 'serverStats');

    this.fe.registerModule(new ModuleDispaceServer({
        fieldSocketManager: this.fieldSocketManager
    }), 'd');

    return fe;
};

_p.makeVisual = function(opts) {
    var fe = this.makeBasicFe(opts);

    // visual core classes

    this.nb = new flame.view.cocos.CocosNodeBuilder({
        assetManager: this.assetManager,
        cosmosManager: this.cosmosManager
    });

    this.stateBuilder = new flame.view.StateBuilder({
        nb : this.nb,
        config: this.config
    });

    this.viewport = new flame.view.cocos.CocosViewport({
        config: this.config,
        nb : this.nb,
        canvasId: 'canvas-cocos2d',
        webpage: new flame.view.Webpage(),
        audibility: 50,
    });

    // visual modules

    fe.registerModule(new flame.engine.ModuleCocos({
        viewport: this.viewport,
        stateBuilder: this.stateBuilder,
        config: this.config,
        containerPlans: this.cosmosManager.getAllInDirectory('container', false, true)
    }),  'c');

    fe.registerModule(new ModuleInsight({
        viewport: this.viewport,
    }), 'insight');

    this.protagonist = new ModuleProtagonist({
        viewport: this.viewport,
        syncCamera: true,
        mouse: this.mouse
    });
    this.fe.registerModule(this.protagonist, 'p');

    this.ui = new ModuleUi({
        viewport: this.viewport
    });
    this.fe.registerModule(this.ui, 'ui');

    return fe;
};

_p.makeClient = function(opts) {
    var fe = this.makeVisual(opts);

    fe.registerModule(new ModuleDispaceClient({
        gutsManager: this.gutsManager
    }), 'd');

    return fe;
};

_p.makeLocal = function(opts) {
    var fe = this.makeVisual(opts);

    this.registerMasterModules(opts);

    return fe;
};

module.exports = Bootstrap;
