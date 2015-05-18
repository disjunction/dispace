var dispace = require('dispace'),
    Assembly = dispace.entity.Assembly;

describe('dispace.entity.item.Assembly', function() {
    it ('can be created', function() {
        var item1 = new dispace.entity.item.Item({mark: 'shocker'}, 'turret');
        var item2 = new dispace.entity.item.Item({mark: 'lamarck-hawk'}, 'hull');
        var assembly = new Assembly({
            components: {
                'turret1': item1,
                'hull': item2
            }
        });
        expect(typeof assembly).toBe('object');
    });
});
