var cc = require('cc');

/**
 * opts:
 */
var GutsManager = cc.Class.extend({
    ctor: function(opts) {
        this.opts = opts;
    },

    makeGutsByAssembly: function(assembly) {
        var g = {
            i: [1, 1]  // infrastructure can not be zero
        };

        function addGut(name, value) {
            if (!g[name]) {
                g[name] = [0, 0];
            }
            g[name][0] += value;
        }

        for (var i in assembly.opts.components) {
            var c = assembly.opts.components[i];

            if (c.params) {
                if (c.params.infra) {
                    addGut('i', c.params.infra);
                }
                if (c.params.armor) {
                    addGut('a', c.params.armor);
                }
                if (c.params.shield) {
                    addGut('s', c.params.shield);
                }
            }
        }

        return g;
    }
});

module.exports = GutsManager;
