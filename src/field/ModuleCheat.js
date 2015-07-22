/*jslint node: true */
"use strict";

var cc = require('cc'),
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract');

var ModuleCheat = ModuleAbstract.extend({
    injectFe: function(fe, name) {
        this._super(fe, name);
        this.enabled = false;

        var p = this.fe.m.p;

        if (p) {
            var webpage = p.opts.viewport.opts.webpage;
            this.window = webpage.window;
            this.localStorage = this.window.localStorage;

            if (this.localStorage) {
                this.enabled = JSON.parse(this.localStorage.getItem('dispace-cheat'));
            }
        }
    },

    setEnabled: function(enabled) {
        this.enabled = enabled;
        if (this.localStorage) {
            this.localStorage.setItem('dispace-cheat', JSON.stringify(this.enabled));
        }
    }

});

module.exports = ModuleCheat;
