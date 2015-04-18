var dispace = require('dispace'),
    item = dispace.entity.item;

describe('entity.item.Assembly', function() {
    it ('can be created', function() {
        var item1 = new item.Item({mark: 'shocker'}, 'turret');
        var item2 = new item.Item({mark: 'lamarck-hawk'}, 'hull');
        var assembly = new item.Assembly({
            items: {
                'turret1': item1,
                'hull': item2
            }
        });
        expect(typeof assembly).toBe('object');
    });
});