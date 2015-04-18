var cc = require('cc');

var AbstractHudListener = cc.Class.extend({
    /**
     * opts:
     * * hudController
     * @param opts object
     */
    ctor: function(opts) { 
        this.opts = opts || {};
    },
});

module.exports = AbstractHudListener;