var cc = require('cc'),
    Item = require('entity/item/Item');
    
var Turret = Item.extend({
    ctor: function(opts) {
        this.type = 'turret';
        Item.prototype.ctor.call(this, opts);
    }
});

module.exports = Turret;