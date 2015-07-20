/*jslint node: true */
"use strict";

var cc = require('cc'),
    flame = require('fgtk/flame'),
    smog = require('fgtk/smog'),
    Cospeak = smog.Cospeak,
    ModuleAbstract = flame.engine.ModuleAbstract;

var ModuleQuestMaster = ModuleAbstract.extend({
    ctor: function(opts) {
        this._super(opts);
        this.quests = {};
    },

    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        this.addNativeListeners([
            "injectField"
        ]);
    },
    onInjectField: function(event) {
        var quests = event.field.quests;
        if (quests) {
            for (var i in quests) {
                this.quests[i] = quests[i];
                this.quests[i].registerQuestMaster(this);
                this.fe.fd.dispatch({
                    type: "injectQuest",
                    questId: i,
                    stats: quests[i].stats
                });
            }
        }
    },
});

module.exports = ModuleQuestMaster;
