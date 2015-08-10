/*jslint node: true */
"use strict";

var cc = require('cc'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    DispaceField = require('dispace/entity/DispaceField'),
    b2 = require('jsbox2d'),
    Rover = require('dispace/entity/thing/Rover'),
    GutsManager = require('dispace/service/GutsManager'),
    ItemManager = require('dispace/service/ItemManager'),
    RoverBuilder = require('dispace/service/RoverBuilder'),
    smog = require('fgtk/smog'),
    util = smog.util.util,
    geo = smog.util.geo,
    Cospeak = smog.Cospeak;

/**
 * opts:
 * * fe - field engine
 * * field
 * * size
 * @param {object} opts
 * @returns {DevGenerator}
 */
var AbstractGenerator = cc.Class.extend({
    ctor: function(opts) {
        this.opts = opts;

        this.field = opts.field || new DispaceField();

        this.cosmosManager = this.opts.fe.opts.cosmosManager;
        this.itemManager = this.opts.fe.opts.itemManager;
        this.thingBuilder = this.opts.fe.opts.thingBuilder;
        this.gutsManager = this.opts.fe.opts.gutsManager;
        this.roverBuilder = this.opts.fe.opts.roverBuilder;

        this.field.draftWorld = new b2.World(new b2.Vec2(0, 0));
        this.thingFinder = new flame.service.ThingFinder({
            fe: opts.fe,
            world: this.field.draftWorld
        });
        this.bodyBuilder = new flame.engine.BodyBuilder({
            world: this.field.draftWorld,
            cosmosManager: this.cosmosManager,
            assetManager: this.opts.fe.opts.assetManager,
            config: this.opts.fe.opts.config
        });
    }
});

var _p = AbstractGenerator.prototype;

_p.fitsInDraftWorld = function(thing) {
    if (!thing.plan.body) return true;

    if (!thing.draftBody) {
        thing.draftBody = this.bodyBuilder.makeBody(thing.plan);
    }

    thing.draftBody.SetTransform(thing.l, thing.a);

    var aabb = new b2.AABB(),
        fixture = thing.draftBody.GetFixtureList();

    aabb.lowerBound = new b2.Vec2(thing.l.x, thing.l.y);
    aabb.upperBound = new b2.Vec2(thing.l.x, thing.l.y);

    while (fixture) {
        var shape = fixture.GetShape(),
            childCount = shape.GetChildCount();
        for (var i = 0; i < childCount; i++) {
            var shapeAABB = new b2.AABB();
            shape.ComputeAABB(shapeAABB, thing.draftBody.GetTransform(), i);
            aabb.Combine(shapeAABB);
        }
        fixture = fixture.GetNext();
    }

    var bodies = this.thingFinder.findAllBodiesInAreaDirty(aabb.lowerBound, aabb.upperBound);

    return bodies.length <= 1;
};

/**
 * extracted from cluster - just finding the best place for a given thing
 *
 * @param  {Thing} thing  [description]
 * @param  {Object} params [see ::cluster]
 * @return {boolean} if successful
 */
_p.attemptPlaceThing = function(thing, params) {
    var l,
        maxAttempts = 5;

    for (var i = 0; i <= maxAttempts; i++) {
        l = cc.clone(Cospeak.readPoint(params.l));

        if (i == maxAttempts) {
            this.field.draftWorld.DestroyBody(thing.draftBody);
            break;
        }

        if (params.size !== 0) {
            var size = Cospeak.readSize(params.size);
            l.x += Math.random() * size.width - size.width / 2;
            l.y += Math.random() * size.height - size.height / 2;
        }

        thing.l = l;
        thing.a = Math.random() * geo.PI2;

        if (this.fitsInDraftWorld(thing)) {
            break;
        }
    }

    if (i == maxAttempts) {
        console.log('could not find place for ' + thing.plan.from);
        return false;
    }

    if (params.horde && this.field.ai && this.field.ai.hordes && this.field.ai.hordes[params.horde]) {
        this.field.ai.hordes[params.horde].pushThing(thing);
    }

    this.field.things.push(thing);
    return true;
};

/**
 * params:
 * * planSrcList
 * * count, default = 1
 * * l: center point (cospeak) |  ls: [l1, l2, ... ln]
 * * size: (cospeak), default = 0
 * * form: enum("rect", "circle"), default = "rect"
 * * ai: boolean
 */
_p.cluster = function(params){
    var plans = this.cosmosManager.getByArray(params.planSrcList);
    var count = params.count;
    if (!count) {
        count = params.ls ? params.ls.length : 1;
    }
    for (var i = 0; i < count; i++) {
        var thing,
            plan = util.randomElement(plans);
        if (plan.from.substring(0, 9) == 'assembly/') {
            thing = this.roverBuilder.makeRoverByAssemblyPlan(plan);
            if (params.ai) {
                thing.ai = {};
            }
        } else {
            thing = this.thingBuilder.makeThing({
                plan: plan
            });
        }

        if (params.ls) {
            params.l = params.ls[i];
        }

        this.attemptPlaceThing(thing, params);
    }
};

/**
 * Fills the area with tiles (by default sized as 64x64),
 * taking random ones from provided list
 * @param  {Array.[thingPlan]} plans
 * @param  {int} tileSize
 */
_p.tileField = function(plans, tileSize) {
    if (!tileSize) {
        tileSize = 64;
    }

    for (var i = 0; i < this.field.size.width / tileSize; i++) {
        for (var j = 0; j < this.field.size.height / tileSize; j++) {
            var plan = util.randomElement(plans),
                thing = new Thing({
                    plan: plan,
                    l: {
                        x: i * tileSize + tileSize / 2 - 1/16, // 1/16 prevents a tiny space between tiles
                        y: j * tileSize + tileSize / 2 - 1/16
                    }
                });
            this.field.things.push(thing);
        }
    }
};

_p.cleanupDraftBodies = function() {
    for (var i = 0; i < this.field.things.length; i++) {
        var thing = this.field.things[i];
        if (thing.draftBody) {
            this.field.draftWorld.DestroyBody(thing.draftBody);
            delete thing.draftBody;
        }
    }
};

_p.pushEdgeDeco = function() {
    var fieldSize = this.field.size,
        edgeElementSize = {width: 16, height: 2},
        ppm = 32,
        planBottom = this.opts.fe.opts.cosmosManager.getResource('thing/bg/very-edge'),
        planTop = cc.clone(planBottom),
        planLeft = cc.clone(planBottom),
        planRight = cc.clone(planBottom),
        thing, i;

    planTop.states.basic.main.a = 180;
    planLeft.states.basic.main.a = -90;
    planRight.states.basic.main.a = 90;

    var bgPlan = {
        "static": true,
        "states" : {
            "basic" : {
                "color": {
                    "layer": "bg",
                    "type": "bar",
                    "color": "#a79a8e",
                    "width": fieldSize.width * ppm + 6400,
                    "height": fieldSize.height * ppm + 6400,
                    "zIndex": -100
                }
            }
        }
    };
    thing = new Thing({
        plan: bgPlan,
        l: cc.p(fieldSize.width / 2, fieldSize.height / 2)
    });

    this.field.things.push(thing);

    for (i = 0; i < fieldSize.width / edgeElementSize.width; i++) {
        thing = new Thing({
            plan: planBottom,
            l: cc.p(i * edgeElementSize.width + edgeElementSize.width / 2, -edgeElementSize.height / 2)
        });
        this.field.things.push(thing);

        thing = new Thing({
            plan: planTop,
            l: cc.p(i * edgeElementSize.width + edgeElementSize.width / 2, fieldSize.height + edgeElementSize.height / 2)
        });
        this.field.things.push(thing);
    }
    for (i = 0; i < fieldSize.height / edgeElementSize.width; i++) {
        thing = new Thing({
            plan: planLeft,
            l: cc.p(-edgeElementSize.height / 2, i * edgeElementSize.width + edgeElementSize.width / 2)
        });
        this.field.things.push(thing);

        thing = new Thing({
            plan: planRight,
            l: cc.p(fieldSize.width + edgeElementSize.height / 2, i * edgeElementSize.width + edgeElementSize.width / 2)
        });
        this.field.things.push(thing);
    }
};

module.exports = AbstractGenerator;
