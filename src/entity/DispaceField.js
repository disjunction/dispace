/*jslint node: true */
"use strict";

var cc = require('cc'),
    flame = require('fgtk/flame'),
    Field = flame.entity.Field;

var DispaceField = Field.extend({
    ctor: function(opts) {
        Field.prototype.ctor.call(this, opts);
        this.spawnPoints = [];
        this.quests = [];
    }
});

module.exports = DispaceField;
