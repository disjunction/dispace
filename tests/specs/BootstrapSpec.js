var dispace = require('dispace'),
    Bootstrap = dispace.Bootstrap,
    fixtures = require('dispace_tu/fixtures');

describe('dispace.Bootstrap', function() {
    it ('check: makeBasicFe()', function() {
        var o = new Bootstrap({
            cosmosManager: fixtures.makeCosmosManager(),
            assetManager: fixtures.makeAssetManager(),
            config: fixtures.makeConfig()
        });
        var fe = o.makeBasicFe();
    });
});
