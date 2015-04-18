var cc = require('cc'),
    Item = require('entity/item/Item');

var Assembly = Item.extend({
    ctor: function(opts) {
        this.type = 'assembly';
        Item.prototype.ctor.call(this, opts);
        if (!this.opts.items) {
            throw new Error('Assembly require "items" opt');
        }
    }
});

module.exports = Assembly;
