/*jslint node: true */
"use strict";

var cc = require('cc'),
    b2 = require('jsbox2d'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract'),
    ViewponAbstract = require('dispace/view/viewpon/ViewponAbstract'),
    InsightEffectApplier = require('dispace/view/InsightEffectApplier'),
    geo = require('fgtk/smog').util.geo;

var viewhullMapping = {
    "abstract": require("dispace/view/viewhull/ViewhullAbstract"),
    "propeller": require("dispace/view/viewhull/ViewhullPropeller"),
    "track": require("dispace/view/viewhull/ViewhullTrack"),
    "smartTrack": require("dispace/view/viewhull/ViewhullSmartTrack"),
};

/**
 * opts:
 * * viewport
 * * config
 */
var ModuleInsight = ModuleAbstract.extend({
    ctor: function(opts) {
        this._super(opts);
        this.insightEffectApplier = new InsightEffectApplier(this);
    },

    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);
        var thingPlanHelper = this.fe.opts.cosmosManager.thingPlanHelper;

        this.damageColors = {
            'a': thingPlanHelper.readValue('#aaffaa'),
            'i': thingPlanHelper.readValue('#ff0000'),
            's': thingPlanHelper.readValue('#77bbff')
        };

        this.addNativeListeners([
            'injectThing',
            'interstate',
            'shot',
            'hit',
            'simEnd',
            'teffChange',
        ]);

        this.viewhulls = {};

        this.moduleVicinity = fe.m.vicinity;
    },

    displayDamage: function(hit) {
        var thingPlan = {states: {basic: {}}},
            p = this.opts.viewport.scrolledLocation2Target(hit.l);

        for (var i in hit.damage) {
            var a = Math.random() * geo.PI2,
                cosa = Math.cos(a),
                sina = Math.sin(a),
                r1 = 10,
                r2 = 30,
                damageStart = cc.p(r1 * cosa + p.x, r1 * sina + p.y),
                moveX = r2 * cosa,
                moveY = r2 * sina;

            var damageNodePlan = {
                damageStart: damageStart,
                type: 'label',
                layer: 'hud',
                text: '' + hit.damage[i],
                fontSize: 12,
                stroke: {
                    color: '#777777',
                    width: 1
                },
                size: {width: 0, height: 0}, // this puts the text directly in the center
                color: this.damageColors[i],
                ani: ['sequence', [
                    ['spawn', [
                        ['moveBy', [0.7, moveX, moveY]],
                        ['fadeTo', [0.7, 50]]
                    ]],
                    ['removeSelf']
                ]]
            };

            thingPlan.states.basic[i] = damageNodePlan;
        }

        var thing = new Thing({
            plan: thingPlan
        });
        this.fe.m.c.envision(thing);

        for (i in hit.damage) {
            var node = thing.look.nodes[i];
            node.setPosition(node.plan.damageStart);
        }
    },


    onInjectThing: function(event) {
        var thing = event.thing;
        if (thing.type && thing.type == 'rover') {
            this.displayRover(thing);
        }
    },

    getViewhullForThing: function(thing) {
        if (thing.plan && thing.plan.viewhull && viewhullMapping[thing.plan.viewhull.className]) {
            var className = thing.plan.viewhull.className;
            if (!this.viewhulls[className]) {
                var ViewhullClass = viewhullMapping[className];
                this.viewhulls[className] = new ViewhullClass({
                    fe: this.fe
                });
            }
            return this.viewhulls[className];
        }
        return null;
    },

    onInterstate: function(event) {
        var thing = event.thing,
            interstate = event.interstate;

        if (!thing.isControlled() || !interstate.enabled) {
            return;
        }
        var viewhull = this.getViewhullForThing(thing);
        if (viewhull) {
            viewhull.applyInterstate(interstate, thing);
        }
    },

    getViewponForComponent: function(component) {
        if (!component.viewpon) {
            component.viewpon = new ViewponAbstract({
                fe: this.fe,
                viewponPlan: this.fe.opts.cosmosManager.getResource(component.opts.viewponSrc)
            });
        }
        return component.viewpon;
    },

    onShot: function(event) {
        if (this.moduleVicinity) {
            var v = this.moduleVicinity.getVicinityByL(event.shot.l1);
            if (!v.visible) return;
        }
        var viewpon = this.getViewponForComponent(event.shot.subjComponent);
        viewpon.showShot(event.shot);
    },

    onHit: function(event) {
        if (this.moduleVicinity) {
            var v = this.moduleVicinity.getVicinityByL(event.hit.l);
            if (!v.visible) return;
        }
        var viewpon = this.getViewponForComponent(event.hit.subjComponent);
        viewpon.showHit(event.hit);
        this.displayDamage(event.hit);
    },

    onSimEnd: function(event) {
        var important = this.fe.m.de.importantThings;
        for (var i = 0; i < important.length; i++) {
            var thing = important[i];
            if (thing.things) {
                for (var j in thing.things) {
                    this.fe.m.c.syncLookFromThing(thing.things[j]);
                }
            }
        }
    },

    onTeffChange: function(event) {
        this.insightEffectApplier.applyTeffChange(event);
    },

    displayRover: function(thing) {
        if (thing.plan.viewhull) {
            var viewhull = this.getViewhullForThing(thing);
            if (viewhull) viewhull.onEnvision(thing);
        }
        for (var i in thing.things) {
            var subthing = thing.things[i];
            this.fe.m.c.envision(subthing);
        }
    },
});

module.exports = ModuleInsight;
