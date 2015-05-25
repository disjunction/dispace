var dispace = require('dispace'),
    DispaceThingSerializer = dispace.service.serialize.DispaceThingSerializer,
    fixtures = require('dispace_tu/fixtures');

describe('dispace.service.serialize.DispaceThingSerializer', function() {
    it ('serializes/unserializes rover', function() {
        batch = fixtures.makeSerializationBatch();

        var assembly = batch.roverBuilder.makeAssembly({
            components: {
                hull: 'item/component/hull/faf-m29',
                turret1: 'item/component/turret/security-ripeater',
                turret2: 'item/component/turret/security-ripeater',
                engine: 'item/component/engine/lamarck-donkey',
            }
        });

        var rover = batch.roverBuilder.makeRover(assembly);
        rover.l = {x: 3, y: 5};
        rover.id = 'mA';
        var serializedRover = batch.thingSerializer.serializeInitial(rover);

        expect(serializedRover[1].type).toBe('rover');
        expect(serializedRover[1].p).toEqual([3, 5]);
        expect(serializedRover[1].planSrc).toBe('thing/rover/hull/faf-m29-hull');

        var newRover = batch.thingSerializer.unserializeInitial(serializedRover);
        expect(newRover.l.x).toBe(3);
        expect(newRover.l.y).toBe(5);
        console.log(newRover.c);
    });
});
