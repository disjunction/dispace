/*jslint node: true */
"use strict";

var cc = require('cc'),
    util = require('fgtk/smog').util.util,
    flame = require('fgtk/flame'),
    Field = flame.entity.Field;

var DispaceField = Field.extend({
    ctor: function(opts) {
        Field.prototype.ctor.call(this, opts);
        this.spawnPoints = null;
        this.quests = {};
        this.ai = {
            hordes: {}
        };
    },

    pushField: function(field) {
        Field.prototype.pushField.call(this, field);
        if (field.spawnPoints) {
            this.spawnPoints = util.combineObjects(this.spawnPoints, field.spawnPoints);
        }
        if (field.ai && field.ai.hordes) {
            this.ai.hordes = util.combineObjects(this.ai.hordes, field.ai.hordes);
        }
        if (field.quests) {
            this.quests = util.combineObjects(this.quests, field.quests);
        }
    }
});

module.exports = DispaceField;
