var cc = require('cc');

var SelfUpdater = cc.Class.extend({
    /**
     * opts:
     * * hudController
     * @param opts object
     */
    ctor: function(opts) {
        this.opts = opts || {};
        this.currentTime = 0;
        this.targetTime = 0;
    },

    update: function(dt, force) {
        if (!force && this.targetTime >= this.currentTime) {
            this.currentTime += (dt || 0);
            return;
        }

        var addTime = this.doUpdate();

        if (addTime) {
            this.targetTime += addTime;
        }
    }
});

module.exports = SelfUpdater;
