/*jslint node: true */
"use strict";

var b2 = require('jsbox2d'),
    cc = require('cc'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract'),
    geo = require('fgtk/smog').util.geo;

var viewhullMapping = {
    'propeller': require('dispace/view/viewhull/ViewhullPropeller'),
    'tracks': require('dispace/view/viewhull/ViewhullTracks')
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

        this.fe.fd.addListener('interstate', function(event) {
            this.applyInterstate(event);
        }.bind(this));

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

    applyInterstate: function(event) {
        var thing = event.thing,
            interstate = event.interstate;
        if (thing.plan && thing.plan.viewhullType && viewhullMapping[thing.plan.viewhullType]) {
            var ViewhullClass = viewhullMapping[thing.plan.viewhullType];
            if (!this.viewhulls[thing.plan.viewhullType]) {
                this.viewhulls[thing.plan.viewhullType] = new ViewhullClass({
                    fe: this.fe
                });
            }
            this.viewhulls[thing.plan.viewhullType].applyInterstate(interstate, thing);
        }
    }
});

module.exports = ModuleInsight;
