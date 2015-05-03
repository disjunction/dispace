var cc = require('cc'),
    Item = require('./item/Item'),
    Component = require('./item/Component');

/**
 * opts:
 * * cosmosManager
 */
var ItemManager = cc.Class.extend({
    ctor: function(opts) {
        if (!opts.cosmosManager) {
            throw new Error('ItemManager requires "cosmosManager" opt');
        }
        this.opts = opts;
    },
    
    makeItem: function(itemSrc, type, n) {
        var opts = this.opts.cosmosManager.getResource(itemSrc),
            item;
    
        switch (type) {
            case 'component':
                item = new Component(opts, type, n);
                break;
            default:
                item = new Item(opts, type, n);
                break;
        }
        
        return item;
    }
});

module.exports = ItemManager;