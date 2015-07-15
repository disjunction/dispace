/*jslint node: true */
"use strict";

var cc = require('cc'),
    flame = require('fgtk/flame'),
    Field = flame.entity.Field;

var DispaceField = Field.extend({
    ctor: function(opts) {
        Field.prototype.ctor.call(this, opts);
        this.spawnPoints = null;
        this.quests = [];
    },

    pushField: function(field) {
        console.log('pushing', field);
        Field.prototype.pushField.call(this, field);
        if (field.spawnPoints) {
            this.spawnPoints = field.spawnPoints;
        }
    }
});

module.exports = DispaceField;
