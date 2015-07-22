var dispace = require('dispace'),
    DevGenerator = dispace.field.generator.DevGenerator,
    fixtures = require('dispace_tu/fixtures');

describe('dispace.field.generator.DevGenerator', function() {
    it ('generates', function() {
        var fe = fixtures.makeFeMaster(),
            o = new DevGenerator({
                fe: fe
            }),
            plan = fe.opts.cosmosManager.get('thing/obstacle/house4x4');

        o.cluster({
            "planSrcList": [
                "thing/obstacle/house4x4",
            ],
            "l": [32, 32],
            "size": 30,
            "count": 30,
        });
    });
});
