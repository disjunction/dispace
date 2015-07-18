/*jslint node: true */
"use strict";

var cc = require('cc'),
    smog = require('fgtk/smog'),
    util = smog.util.util,
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract');

var ModuleServerStats = ModuleAbstract.extend({
    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);
        this.addNativeListeners([
            'registerDb'
        ]);
    },

    onRegisterDb: function(event) {
        this.db = event.db;
        this.addNativeListeners([
            'injectSibling',
            'removeSibling',
        ]);

        this.saveFeStatus();

        setTimeout(this.heartbeat.bind(this), 1000);
    },

    heartbeat: function() {
        this.db.collection('roomStatus').update(
            {_id: this.fe.name},
            {
                $set: {
                    heartbeat: Date.now()
                }
            }
        );

        setTimeout(this.heartbeat.bind(this), 1000);
    },

    saveFeStatus: function() {
        this.db.collection('roomStatus').save({
            _id: this.fe.name,
            slots: 8,
            heartbeat: Date.now(),
            siblingCount: util.countKeys(this.fe.siblingMap)
        });
    },

    onInjectSibling: function(event) {
        setTimeout(this.saveFeStatus.bind(this), 100);
    },
    onRemoveSibling: function(event) {
        setTimeout(this.saveFeStatus.bind(this), 100);
    },
});

module.exports = ModuleServerStats;
