var dispace = require('dispace'),
    DevGenerator = dispace.field.generator.DevGenerator,
    fixtures = require('dispace_tu/fixtures');

describe('dispace.field.generator.DevGenerator', function() {
    it ('generates', function() {
        var fe = fixtures.makeFeBox2d(),
            o = new DevGenerator({
                fe: fe
            }),
            plan = fe.opts.cosmosManager.get('thing/obstacle/house4x4');
        o.placeRandom({
            thingPlan: plan,
            count: 10,
            x: 10, y: 10,
            width: 50, height: 50
        });
    });
});
