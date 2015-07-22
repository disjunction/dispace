/*jslint node: true */
"use strict";

var cc = require('cc'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing;

/**
 * extracted from ModuleInsight, just to be keep it smaller
 */
var InsightEffectApplier = cc.Class.extend({
    /**
     * @param  {ModuleInsight} insight
     */
    ctor: function(insight) {
        this.insight = insight;

        // this is done to avoid complicated processing,
        // but go directly to the method
        this.effectMap = {
            "+explode": this.onAddExplode,
            "+spawn": this.onAddSpawn,
            "-inert": this.onRemoveInert,
        };
    },

    applyTeffChange: function(event) {
        var method = this.effectMap[event.teff];
        if (method) {
            method.call(this, event.thing);
        }
    },

    onAddExplode: function(thing) {
        var viewhull = this.insight.getViewhullForThing(thing);
        if (viewhull) viewhull.explode(thing);
    },

    onAddSpawn: function(thing) {
        var viewhull = this.insight.getViewhullForThing(thing);
        if (viewhull) viewhull.spawn(thing);
    },

    onRemoveInert: function(thing) {
        var fe = this.insight.fe;
        if (thing.i && thing.i.array.length) {
            fe.fd.dispatch({
                type: "interstate",
                thing: thing,
                interstate: thing.i,
            });
        }
    },
});

module.exports = InsightEffectApplier;
