/*jslint node: true */
"use strict";

var b2 = require('jsbox2d'),
    cc = require('cc'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract'),
    ViewponAbstract = require('dispace/view/viewpon/ViewponAbstract'),
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
    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);
        var thingPlanHelper = this.fe.opts.cosmosManager.thingPlanHelper;

        this.damageColors = {
            'a': thingPlanHelper.readValue('#ffffff'),
            'i': thingPlanHelper.readValue('#ff0000'),
            's': thingPlanHelper.readValue('#7799ff')
        };

        this.addNativeListeners([
            'injectThing',
            'interstate',
            'shot',
            'hit',
            'simEnd',
            'teff',
        ]);

        this.viewhulls = {};
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
            var node = thing.state.nodes[i];
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

        if (thing.inert || !interstate.enabled) {
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
        var viewpon = this.getViewponForComponent(event.shot.subjComponent);
        viewpon.showShot(event.shot);
    },

    onHit: function(event) {
        var viewpon = this.getViewponForComponent(event.hit.subjComponent);
        viewpon.showHit(event.hit);
        this.displayDamage(event.hit);
    },

    onSimEnd: function(event) {
        var important = this.fe.m.de.importantThings;
        for (var i = 0; i < important.length; i++) {
            var thing = important[i];
            if (thing.things) for (var j in thing.things) {
                this.fe.m.c.syncStateFromThing(thing.things[j]);
            }
        }
    },

    onTeff: function(event) {
        var thing = event.thing;
        for (var i = 0; i < event.teff.length; i++) {
            var effect = event.teff[i];
            switch (effect) {
                case "+explode":
                    if (thing.plan.states.explode) {
                        this.fe.m.c.changeState(thing, 'explode');
                    }
                    if (thing.things) {
                        for (var j in thing.things) {
                            this.fe.m.c.removeThing(thing.things[j]);
                        }
                        //thing.things = null;
                    }
                    break;
                case "+spawn":
                    var viewhull = this.getViewhullForThing(thing);
                    if (viewhull) viewhull.spawn(thing);
                    break;
                default:
                    throw new Error('uknown teff while processing in Insight: ' + effect);
            }
        }
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
