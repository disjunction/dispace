/*jslint node: true */
"use strict";

var cc = require('cc'),
    smog = require('fgtk/smog'),
    util = smog.util.util,
    FriendOrFoe = require('dispace/ai/FriendOrFoe');
/**
 * opts:
 * * questId
 * * plan
 * * fe
 */
var QuestGuildDrones = cc.Class.extend({
    ctor: function(opts) {
        this.opts = opts;
        this.fof = this.opts.fe.opts.fof;
        this.timeQueue = require('radiopaque').create().timeAt(opts.fe.simSum);
    },

    registerQuestMaster: function(questMaster) {
        this.questMaster = questMaster;
        var fe = this.opts.fe;

        fe.fd.addListener('hit', this.onHit.bind(this));
        fe.fd.addListener('simEnd', this.onSimEnd.bind(this));
        fe.fd.addListener('respawn', this.onRespawn.bind(this));
        fe.fd.addListener('injectSibling', this.onInjectSibling.bind(this));

        this.timeQueue.pushIn(1, true);

        this.resetStats();
    },

    resetField: function() {
        var things = this.opts.fe.field.things;
        for (var i = things.length - 1; i >= 0; i--) {
            if (things[i].assembly && things[i].assembly.opts.plan.info.short == "hexmkr") {
                continue;
            }
            if (things[i].type == 'rover') {
                this.opts.fe.removeThing(things[i]);
            }
        }
    },

    resetStats: function() {
        this.stats = {
            federation: 0,
            pirate: 0,
            time: this.opts.plan.time
        };
        this.resetField();
    },

    getFinalMessage: function(stats) {
        var text = "The round is Over.<br>";

        if (this.stats.federation === 0 && this.stats.pirate === 0) {
            text += "You didn't even try to play :( Destroy the nasty drones! please!!!<br>";
        } else if (this.stats.federation > this.stats.pirate) {
            text += "<b>Federation</b> wins!!!<br>";
        } else if (this.stats.federation < this.stats.pirate) {
            text += "<b>Pirates</b> win!!!<br>";
        } else {
            text += "draw... Try harder next time.<br>";
        }

        text += "next round has begun!";

        return text;
    },

    dispatchUpdateQuest: function() {
        this.opts.fe.fd.dispatch({
            type: "updateQuest",
            questId: this.opts.questId,
            stats: this.stats
        });
    },

    onHit: function(event) {
        if (event.hit.isKill) {
            var affectedFaction = event.hit.subjThing.assembly.opts.plan.faction;

            // kill by unknown faction
            if (this.stats[affectedFaction] === undefined) return;

            var relation = this.fof.getRelation(event.hit.subjThing, event.hit.objThing);
            if (relation == FriendOrFoe.FOE) {
                if (event.hit.objThing.assembly.opts.plan.faction == 'guild') {
                    this.stats[affectedFaction] += this.opts.plan.pointsPerGuild;
                } else {
                    this.stats[affectedFaction] += this.opts.plan.pointsPerFoe;
                }
            } else if (relation == FriendOrFoe.FRIEND) {
                this.stats[affectedFaction] += this.opts.plan.pointsPerFriend;
            } else {
                // kill of neutral?
                return;
            }

            this.dispatchUpdateQuest();
        }
    },

    onSimEnd: function(event) {
        if (this.timeQueue.timeAt(this.opts.fe.simSum).fetch()) {
            this.dispatchUpdateQuest();
            this.stats.time --;

            if (this.stats.time <= 0) {
                this.opts.fe.fd.dispatch({
                    type: "alert",
                    message: this.getFinalMessage()
                });
                this.resetStats();
            }

            this.timeQueue.pushIn(1, true);
        }
    },

    onRespawn: function(event) {
        var affectedFaction = event.thing.assembly.opts.plan.faction;
        // shouldn't happen...
        if (this.stats[affectedFaction] === undefined) return;
        this.stats[affectedFaction] += this.opts.plan.pointsPerRespawn;
        this.dispatchUpdateQuest();
    },

    onInjectSibling: function(event) {
        // if we just got the first player,
        // then we better restart the mission
        if (util.countKeys(this.opts.fe.siblingMap) == 1) {
            this.resetStats();
        }
    },
});

module.exports = QuestGuildDrones;
