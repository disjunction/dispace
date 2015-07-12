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
    geo = require('fgtk/smog').util.geo,
    AbstractGenerator = require('./AbstractGenerator');

/**
 * opts:
 * * fe - field engine
 * * field
 * @param {object} opts
 * @returns {DevGenerator}
 */
var DevGenerator =  AbstractGenerator.extend();

var _p = DevGenerator.prototype;

/**
 * params:
  * * count
 * * x
 * * y
 * * width
 * * height
 */
_p.placeRandomRovers = function(params){

    var rawAssemblies = this.cosmosManager.getAllInDirectory('assembly'),
        assemblyPlans = [];
    for (var i in rawAssemblies) {
        assemblyPlans.push(rawAssemblies[i]);
    }

    var count = params.count;
    params.count = 1;
    for (i = 0; i < count; i++) {
        params.assemblyPlan = assemblyPlans[Math.floor(Math.random()*assemblyPlans.length)];
        this.placeRovers(params);
    }
};

/**
 * params:
 * * assemblyPlan
 * * count
 * * x
 * * y
 * * width
 * * height
 */
_p.placeRovers = function(params){
    for (var i = 0; i < params.count; i++) {
        var rover = this.roverBuilder.makeRoverByAssemblyPlan(params.assemblyPlan);
        rover.l = {
            x: Math.random() * params.width + params.x,
            y: Math.random() * params.height + params.y
        };
        rover.a = Math.random() * geo.PI2;
        this.field.things.push(rover);
    }
};

module.exports = DevGenerator;
