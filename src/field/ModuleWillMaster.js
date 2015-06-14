/*jslint node: true */
"use strict";

var cc = require('cc'),
    flame = require('fgtk/flame'),
    ModuleAbstract = flame.engine.ModuleAbstract;

var ModuleWillMaster = ModuleAbstract.extend({
    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);
    },

    processWillArray: function(willArray, siblingId) {
        for (var i = 0; i < willArray.length; i++) {
            this.processWill(willArray[i], siblingId);
        }
    },

    processWill: function(will, siblingId) {
        var willId = will[0],
            willOperation = will[1],
            params = will.length > 2 ? will[2] : null;

        if (this[willOperation]) {
            this[willOperation](willId, siblingId, params);
        } else {
            throw new Error('unknow will operation ' + willOperation);
        }
    },

    spawnRover: function(willId, siblingId, params) {
        var cm = this.fe.opts.cosmosManager,
            assemblyPlan = cm.get(params.assemblySrc),
            rover = this.fe.opts.roverBuilder.makeRoverByAssemblyPlan(assemblyPlan),
            sibling = this.fe.siblingMap[siblingId],
            avatar = new flame.entity.Avatar({
                sibling: sibling,
                thing: rover
            });
        sibling.avatar = avatar;
        rover.avatar = avatar;
        rover.l = cc.p(5,5);
        this.fe.injectThing(rover);
    },

});

module.exports = ModuleWillMaster;
