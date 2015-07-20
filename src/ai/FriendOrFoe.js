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
        if (!subjThing || !objThing) {
            return relations.NEUTRAL;
        }

        if (subjThing.type != 'rover' || objThing.type != 'rover' || !subjThing.assembly || !objThing.assembly) {
            return relations.NEUTRAL;
        }

        if (subjThing.assembly.opts.plan.faction == objThing.assembly.opts.plan.faction) {
            return relations.FRIEND;
        } else {
            return relations.FOE;
        }
    },
});

for (var i in relations) {
    FriendOrFoe[i] = relations[i];
}

module.exports = FriendOrFoe;
