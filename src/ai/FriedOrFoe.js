/*jslint node: true */
"use strict";

var cc = require('cc');

var relations = {
    NEUTRAL: 0,
    FRIEND: 1,
    FOE: 2,
    PRAY: 3
};

var FriendOrFoe = cc.Class.extend({
    ctor: function(opts) {
        this.opts = opts;
    },

    getRelation: function(subjThing, objThing) {
        if (objThing.type == 'rover') {
            return relations.FOE;
        }

        return relations.NEUTRAL;
    },
});

for (var i in relations) {
    FriendOrFoe[i] = relations[i];
}

module.exports = FriendOrFoe;
