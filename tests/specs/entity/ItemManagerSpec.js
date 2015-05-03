var dispace = require('dispace'),
    flame = require('fgtk/flame');

describe('entity.ItemManager', function() {   
    it('creates items', function() {
        var dir = __dirname + '/../../cosmos',
        cm = new flame.service.CosmosManager({
            dirs: [
                dir
            ]
        });
        var o = new dispace.entity.ItemManager({
            cosmosManager: cm
        });
        
        var item = o.makeItem('item/raw/water', 'raw', 5);
        expect(item.opts.maxPile).toBe(5);
        
        var item = o.makeItem('item/component/turret/security-ripeater', 'component');
        expect(item.opts.subtype).toBe('turret');
        expect(item.opts.turretType).toBe('weapon');
    });
});