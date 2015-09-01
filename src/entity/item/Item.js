/*jslint node: true */
"use strict";

var cc = require('cc'),
    smog = require('fgtk/smog');

var Item = cc.Class.extend({
    ctor: function(opts, type) {
        this.opts = opts || smog.EMPTY;
        if (!this.type) {
            if (!type) {
                throw new Error('item MUST have a type');
            } else {
                this.type = type;
            }
        }
    }
});

module.exports = Item;