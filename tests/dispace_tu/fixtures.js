var flame = require('flame'),
    FieldEngine = flame.engine.FieldEngine,
    Thing = flame.entity.Thing,
    GutsManager = require('dispace/service/GutsManager'),
    RoverBuilder = require('dispace/service/RoverBuilder'),
    ItemManager = require('dispace/service/ItemManager'),
    DispaceThingSerializer = require('dispace/service/serialize/DispaceThingSerializer');

module.exports = {
    makeConfig: function() {
        return {ppm: 32};
    },

    makeAssetManager: function() {
        return new flame.service.AssetManager({resources: {
            'unittest/placeholder_5x2.png' : {
                width: 160,
                height: 64
            }
        }});
    },

    makeCosmosManager: function() {
        var dir = __dirname + '/../cosmos';
        return new flame.service.CosmosManager({
            dirs: [
                dir
            ]
        });
    },

    makeThingBuilder: function() {
        return new flame.service.ThingBuilder();
    },

    makeSerializationBatch: function() {
        var batch = {};
        batch.cosmosManager = module.exports.makeCosmosManager();
        batch.thingBuilder = module.exports.makeThingBuilder();
        batch.gutsManager = new GutsManager({});
        batch.itemManager = new ItemManager({
            cosmosManager: batch.cosmosManager
        });
        batch.roverBuilder = new RoverBuilder({
            itemManager: batch.itemManager,
            thingBuilder: batch.thingBuilder,
            gutsManager: batch.gutsManager
        });

        batch.thingSerializer = new DispaceThingSerializer({
            cosmosManager: batch.cosmosManager,
            thingBuilder: batch.thingBuilder,
            roverBuilder: batch.roverBuilder
        });
        return batch;
    },

    makeFeBox2d: function() {
        var am = module.exports.makeAssetManager();
            cm = module.exports.makeCosmosManager();
        var fe = new FieldEngine({
                config: {ppm: 32},
                assetManager: am,
                cosmosManager: cm,
            });

        fe.registerModule(new flame.engine.ModuleBox2d({
            cosmosManager: cm,
            assetManager: am,
            config: {ppm: 32}
        }), 'b');

        fe.m.b.makeWorld();

        return fe;
    }
};
