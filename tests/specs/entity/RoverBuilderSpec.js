var dispace = require('dispace'),
    flame = require('fgtk/flame');

describe('entity.RoverBuilder', function() {   
    it('creates rovers', function() {
        var dir = __dirname + '/../../cosmos',
            cm = new flame.service.CosmosManager({dirs: [dir]}),
            itemManager = new dispace.entity.ItemManager({cosmosManager: cm}),
            thingBuilder = new flame.service.ThingBuilder(),
            roverBuilder = new dispace.entity.RoverBuilder({
                itemManager: itemManager,
                thingBuilder: thingBuilder
            });
        
        var assembly = roverBuilder.makeAssembly({
            components: {
                hull: 'item/component/hull/lamarck-hawk',
                turret1: 'item/component/turret/security-ripeater:2',
                turret2: 'item/component/turret/security-ripeater'
            }
        });
        expect(typeof assembly).toBe('object');
        
        var rover = roverBuilder.makeRover(assembly);
        expect(typeof rover).toBe('object');
        expect(typeof rover.things.turret1).toBe('object');
    });
});