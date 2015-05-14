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
            g[name][1] += value;
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
    },


    fullRecover: function(guts) {
        for (var i in guts) {
            if (Array.isArray(guts[i])) {
                guts[i][0] = guts[i][1];
            }
        }
    },

    /**
     * correct expected damage in relation to actual guts
     */
    correctDamage: function(damage, guts) {
        addInfra = 0;
        for (var i in damage) {
            if (i == 'i') continue;
            if (guts[i]) {
                if (guts[i][0] < damage[i]) {
                    addInfra += damage[i] - guts[i][0];
                    damage[i] = guts[i][0];
                }
            } else {
                addInfra += damage[i];
                delete damage[i];
                continue;
            }
            if (damage[i] === 0) {
                delete damage[i];
            }
        }
        if (addInfra > 0) {
            damage.i = damage.i? damage.i + addInfra : addInfra;
        }
    },

    applyDamage: function(damage, guts) {
        for (var i in damage) {
            if (guts[i]) {
                guts[i][0] -= damage[i];
                if (guts[i][0] < 0) {
                    guts[i][0] = 0;
                }
            }
        }
    }
});

module.exports = GutsManager;
