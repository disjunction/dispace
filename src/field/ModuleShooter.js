/*jslint node: true */
"use strict";

var cc = require('cc'),
    smog = require('fgtk/smog'),
    geo = smog.util.geo,
    b2 = require('jsbox2d'),
    flame = require('fgtk/flame'),
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract');

var ModuleShooter = ModuleAbstract.extend({
    ctor: function(opts) {
        this.opts = opts || {};
        this.shootingThings = [];
    },

    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        this.di = 0; // dispace iteration
        this.importantThings = [];

        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        this.shooterIid = 0;

        this.ray = new flame.engine.ray.RayClosestFilterFunction({
            filterFunction: function(thing) {
                if (thing.__instanceId == this.shooterIid) {
                    return true;
                }
            }.bind(this)
        });

        this.addNativeListeners([
            "injectThing",
            "removeThing",
            "simStepCall"
        ]);
    },

    /**
     * a wrapper around the shoot, which checks first the conditions and only then fires
     * @param {Thing} subjThing
     * @param {Component} subjComponent
     * @returns {shotResult|null}
     */
    attemptShoot: function(subjThing, subjComponent) {
        if (subjComponent.lastShot + subjComponent.params.chargeTime < this.fe.timeSum) {
            var shotResult = this.shoot(subjThing, subjComponent);
            this.fe.fd.dispatch({
                type: 'shot',
                shot: shotResult.shot
            });
            if (shotResult.hit) {
                this.fe.fd.dispatch({
                    type: 'hit',
                    hit: shotResult.hit
                });

                if (shotResult.hit.teff) {
                    this.fe.fd.dispatch({
                        type: 'teff',
                        thing: shotResult.hit.objThing,
                        teff: shotResult.hit.teff
                    });
                }

                if (shotResult.hit.isKill) {
                    shotResult.hit.objThing.inert = true;
                    /*
                    this.fe.scheduler.scheduleIn(0.5, {
                        type: 'removeThing',
                        thing: shotResult.hit.objThing
                    });
                    */
                   this.fe.scheduler.scheduleIn(0.5, function() {
                       this.fe.removeThing(shotResult.hit.objThing);
                   }.bind(this));
                }

            }
            subjComponent.lastShot = this.fe.timeSum;
            return shotResult;
        } else {
            return null;
        }
    },

    /**
     * apply damage of subjComponent vs. objThing
     * subjThing is still in params to add friendly-fire modifiers etc.
     */
    calculateDamage: function(subjThing, objThing, subjComponent) {
        function readDamageValue(value) {
            if (Array.isArray(value)) {
                return Math.round(value[0] + Math.random() * (value[1] - value[0]));
            }
            return value;
        }

        if (objThing.inert) {
            return smog.EMPTY;
        }
        // if object thing can be actually damaged, then correct damage values respectively
        if (objThing.g) {
            var effect = subjComponent.params.effect,
                result = {};

            // projectile effects armour
            if (effect.projectile) {
                result.a = readDamageValue(effect.projectile);
            }

            // electric effects shield
            if (effect.electric) {
                result.s = readDamageValue(effect.electric);
            }

            this.fe.opts.gutsManager.correctDamage(result, objThing.g);
            return result;
        } else {
            return smog.EMPTY;
        }
    },

    shoot: function(subjThing, subjComponent) {
        this.shooterIid = subjThing.__instanceId;
        var result = {},
            range = subjComponent.params.range,
            turretThing = subjComponent.thing;

        this.fe.m.b.rayCastFromThing(this.ray, turretThing, range, subjComponent.opts.radius);

        var impulse, recoil, recoilNormal;

        if (this.ray.isHit) {
            var endPoint = cc.clone(this.ray.results[0].p);
            result.hit = {
                l: endPoint,
                damage: this.calculateDamage(subjThing, this.ray.results[0].thing, subjComponent),
                subjComponent: subjComponent,
                subjThing: subjThing,
                objThing: this.ray.results[0].thing
            };

            if (result.hit.damage.i && result.hit.objThing.g && result.hit.damage.i >= result.hit.objThing.g.i[0]) {
                result.hit.isKill = true;
                result.hit.teff = ['+explode'];
            }

            result.shot = {
                isHit: true,
                l1: this.ray.muzzlePoint,
                l2: endPoint,
                subjComponent: subjComponent,
                subjThing: subjThing,
                fraction: this.ray.results[0].fraction
            };
        } else {
            result.shot = {
                isHit: false,
                l1: this.ray.muzzlePoint,
                l2: this.ray.missPoint,
                subjThing: subjThing,
                subjComponent: subjComponent,
                fraction: this.ray.results[0].fraction
            };
        }

        return result;
    },


    /**
     * create a a list for those ones, which can shoot
     */
    onInjectThing: function(event) {
        var components = event.thing.c;
        if (!components) return;
        if (components.turret1 || components.turret1) {
            this.shootingThings.push(event.thing);
        }
    },

    onRemoveThing: function(event) {
        var index = this.shootingThings.indexOf(event.thing);
        if (index >= 0) {
            this.shootingThings.splice(index, 1);
        }
    },

    onSimStepCall: function(event) {
        for (var i = 0; i < this.shootingThings.length; i++) {
            var thing = this.shootingThings[i];
            for (var j in thing.c) {
                var component = thing.c[j];
                if (component.opts.subtype == 'turret' && thing.i.map[j]) {
                    this.fe.m.shooter.attemptShoot(thing, component);
                }
            }
        }
    }
});

module.exports = ModuleShooter;
