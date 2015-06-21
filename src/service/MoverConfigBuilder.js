/*jslint node: true */
"use strict";

var cc = require('cc'),
    smog = require('fgtk/smog'),
    util = smog.util.util;

/**
 * Builds MoverConfig objects based on Assembly
 */
var MoverConfigBuilder = cc.Class.extend({
    ctor: function(opts) {
        this.opts = opts;
    },

    /**
     * @param {object} hc - hullConfig
     * @param {object} ec - engineConfig
     */
    makeBasicMoverConfig: function(hc, ec) {
        var engineAccel = ec.acceleration,
            multiplierForward = hc.multiplierForward || 1,
            multiplierBackward = hc.multiplierBackward || 0.5;

        var moverConfig = {
            chasis: hc.chasis || "error",
            accelForward: engineAccel * multiplierForward,
            accelBackward: engineAccel * multiplierBackward,
            linearDamping: hc.linearDamping || 1,
            angularDamping: hc.angularDamping || 1
        };

        return moverConfig;
    },

    /**
     * @param {object} mc - moverConfig
     * @param {object} hc - hullConfig
     * @param {object} ec - engineConfig
     */
    makeTrackMoverConfig: function(mc, hc, ec) {
        var engineAccel = ec.acceleration,
            multiplierTorque = hc.multiplierTorque || 0.2;
        mc.wheelTorque = engineAccel * multiplierTorque;
        return mc;
    },

    /**
     * @param {object} mc - moverConfig
     * @param {object} hc - hullConfig
     * @param {object} ec - engineConfig
     */
    makeAirCussionMoverConfig: function(mc, hc, ec) {
        var engineAccel = ec.acceleration,
            multiplierTorque = hc.multiplierTorque || 0.2;

        mc.wheelTorque = engineAccel * multiplierTorque;
        mc.accelTurn = hc.accelTurn || mc.accelBackward / 2;
        mc.engineAngle = hc.engineAngle || 30;
        mc.engineAngleAdditional = hc.engineAngleAdditional || mc.engineAngle;
        mc.engineX = hc.engineX || 30;
        return mc;
    },

    combineComponentMoverConfig: function(component) {
        var o1 = component.opts.mover,
            o2 = component.params.mover;
        return util.combineObjects(o1, o2);
    },

    makeByAssembly: function(assembly) {
        var hullConfig = this.combineComponentMoverConfig(assembly.opts.components.hull),
            engineConfig;

        if (assembly.opts.components.engine) {
            engineConfig = this.combineComponentMoverConfig(assembly.opts.components.engine);
        } else {
            engineConfig = {"acceleration": 2};
        }

        var mc = this.makeBasicMoverConfig(hullConfig, engineConfig);
        switch (mc.chasis) {
            case 'track':
                return  this.makeTrackMoverConfig(mc, hullConfig, engineConfig);
            case 'airCushion':
                return  this.makeAirCussionMoverConfig(mc, hullConfig, engineConfig);
            default:
                throw new Error('unknown chasis: ' + mc.chasis);
        }

        return mc;
    }
});

module.exports = MoverConfigBuilder;
