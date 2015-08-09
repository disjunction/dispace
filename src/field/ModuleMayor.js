/*jslint node: true */
"use strict";

var cc = require('cc'),
    smog = require('fgtk/smog'),
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract');

/**
 * should be added somewhere in the end of init
 */
var ModuleMayor = ModuleAbstract.extend({
    ctor: function(opts) {
        ModuleAbstract.prototype.ctor.call(this, opts);
        this.hordeQueue = require('radiopaque').create();
        this.hordes = {};
    },

    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        this.addNativeListeners([
            "injectField",
            "injectThing",
            "removeThing",
            "simStepEnd"
        ]);
    },

    attemptCapture: function(thing) {
        if (thing.type != 'rover' || !thing.ai || thing.horde) {
            return false;
        }

        for (var i in this.hordes) {
            if (this.hordes[i].captureThing) {
                if (this.hordes[i].captureThing(thing)) {
                    thing.horde = this.hordes[i];
                    return true;
                }
            }
        }
    },

    onInjectField: function(event) {
        var ai = event.field.ai;
        if (ai && ai.hordes) {
            for (var i in ai.hordes) {
                this.hordes.name = i;
                this.hordes[i] = ai.hordes[i];
                this.hordes[i].registerMayor(this);
            }
        }
    },

    onInjectThing: function(event) {
        var thing = event.thing;
        this.attemptCapture(thing);
    },

    onRemoveThing: function(event) {
        var thing = event.thing;
        if (thing.horde) {
            thing.horde.removeThing(thing);
            thing.horde = null;
        }
    },

    onSimStepEnd: function(event) {
        var horde = null,
            q = this.hordeQueue.timeAt(this.fe.simSum);
        do {
            horde = q.fetch();
            if (horde) {
                horde.step(event);
            }
        } while (horde);
    },

    runInterstateAction: function(thing, action) {
        var i = thing.i;
        thing.i.setArray(action);
        if (i.changed) {
            i.changed = false;
            this.fe.eq.channel("interstate").broadcast({
                thing: thing,
                interstate: i
            });
        }
    },

    runBehavior: function(behavior) {
        var thing = behavior.thing;
        if (thing.removed) {
            return;
        }
        for (var i = 0; i < behavior.actions.length; i++) {
            var action = behavior.actions[i];
            if (action == "think") {
                if (thing.horde && thing.horde.think) {
                    try {
                        thing.horde.think(thing);
                    } catch(e) {
                        console.log('error while thinking on ', thing)
                        console.log(new Error())
                    }
                }
            }
            if (thing.isControlled() && Array.isArray(action)) {
                switch (action[0]) {
                    case "i":
                        this.runInterstateAction(thing, action[1]);
                        break;
                    default:
                        throw new Error('unexpected behavior action ' + action[0]);
                }
            }
        }
    },

});

module.exports = ModuleMayor;
