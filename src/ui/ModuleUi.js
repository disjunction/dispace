/*jslint node: true */
"use strict";

var cc = require('cc'),
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract');

var ModuleUi = ModuleAbstract.extend({
    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        this.addNativeListeners([
            "globalMessage",
        ]);
    },

    alert: function(text) {

    },

    onGlobalMessage: function(event) {

    }
});

module.exports = ModuleUi;
