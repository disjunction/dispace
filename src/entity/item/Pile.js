var cc = require('cc');

var Pile = cc.Class.extend({
    ctor: function(opts) {
        this.type = 'pile';
        if (!opts.item) {
            throw new Error('Pile requires "item" option')
        }
        Item.prototype.ctor.call(this, opts);
    }
});

module.exports = Pile;