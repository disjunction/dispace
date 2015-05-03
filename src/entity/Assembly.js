var cc = require('cc');

var Assembly = cc.Class.extend({
    ctor: function(opts) {
        if (!opts.components) {
            throw new Error('Assembly require "components" opt');
        }
        this.opts = opts;
    }
});

Assembly.sockets = [
    'B', 'C', 'D', // turrets
    'E', 'F',      // engines
    'S'            // special
];

Assembly.components = [
    'hull',
    'engine',
    'turret1',
    'turret2',
    'special1'
];

module.exports = Assembly;
