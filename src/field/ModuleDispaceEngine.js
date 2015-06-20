/*jslint node: true */
"use strict";

var flame = require('fgtk/flame'),
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract');

/**
 * opts: none?
 */
var ModuleDispaceEngine = ModuleAbstract.extend({
    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);
        this.addNativeListeners([
            "injectAvatar",
            "interstate"
        ]);
    },

    /**
     * creates cyclic links between sibling and thing through an avatar
     * event:
     * * avatar: flame.entity.Avatar
     */
    onInjectAvatar: function(event) {
        var avatar = event.avatar;
        avatar.opts.sibling.avatar = avatar;
        avatar.opts.thing.avatar = avatar;
    },

    /**
     * event:
     * * type: "interstate"
     * * interstate: {interstate}
     * * thing: {flame.entity.Thing}
     */
    onInterstate: function(event) {
        console.log(event);
        console.log('tut');
        var i = event.thing.i,
            j;
        for (j in i) {
            delete i[j];
        }
        for (j in event.interstate) {
            i[event.interstate[j]] = 1;
        }
    }
});

module.exports = ModuleDispaceEngine;
