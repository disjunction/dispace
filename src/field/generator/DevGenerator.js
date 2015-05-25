/*jslint node: true */
"use strict";

var cc = require('cc'),
    flame = require('fgtk/flame'),
    Thing = flame.entity.Thing,
    Field = flame.entity.Field,
    b2 = require('jsbox2d'),
    Rover = require('dispace/entity/thing/Rover'),
    GutsManager = require('dispace/service/GutsManager'),
    ItemManager = require('dispace/service/ItemManager'),
    RoverBuilder = require('dispace/service/RoverBuilder'),
    geo = require('fgtk/smog').util.geo;

/**
 * opts:
 * * fe - field engine
 * * field
 * @param {object} opts
 * @returns {DevGenerator}
 */
function DevGenerator(opts) {
    this.opts = opts;

    this.field = opts.field || new Field();

    this.size = {width: 128, height: 128};

    this.cosmosManager = this.opts.fe.opts.cosmosManager;
    this.itemManager = new ItemManager({
        cosmosManager: this.cosmosManager
    });
    this.thingBuilder = new flame.service.ThingBuilder({
    });

    this.gutsManager = new GutsManager({
    });

    this.roverBuilder = new RoverBuilder({
        itemManager: this.itemManager,
        thingBuilder: this.thingBuilder,
        gutsManager: this.gutsManager
    });
}

var _p = DevGenerator.prototype;

/**
 * params:
 * * thingPlan
 * * count
 * * x
 * * y
 * * width
 * * height
 */
_p.placeRandom = function(params){
    for (var i = 0; i < params.count; i++) {
        var thing = new Thing({
            plan: params.thingPlan,
            l: {
                x: Math.random() * params.width + params.x,
                y: Math.random() * params.height + params.y
            },
            a: Math.random() * geo.PI2
        });
        this.field.things.push(thing);
    }
};


_p.createEdges = function(){
    var edgeThing = new Thing();

    var size = this.size,
        points = [];
    points.push(new b2.Vec2(size.width, size.height));
    points.push(new b2.Vec2(0, size.height));
    points.push(new b2.Vec2(0, 0));
    points.push(new b2.Vec2(size.width, 0));
    this.opts.fe.m.b.makeLoopEdges(points, edgeThing);
};

module.exports = DevGenerator;
