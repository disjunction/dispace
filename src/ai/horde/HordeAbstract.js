/*jslint node: true */
"use strict";

var cc = require('cc'),
    b2 = require('jsbox2d'),
    flame = require('fgtk/flame'),
    smog = require('fgtk/smog'),
    Cospeak = smog.Cospeak,
    geo = smog.util.geo,
    Behavior = require('dispace/ai/Behavior'),
    FriendOrFoe = require('dispace/ai/FriendOrFoe');

// reusable boundaries for AABB
var bottomLeft = new b2.Vec2(),
    topRight = new b2.Vec2();

/**
 * opts:
 * * fe
 * * plan
 * * name
 *
 * optional methods:
 * * captureThing
 *
 * requires:
 * * fe.m.shooter
 * * fe.opts.fof
 * * fe.opts.thingFinder
 */
var HordeAbstract = cc.Class.extend({
    ctor: function(opts) {
        this.opts = opts;
        this.fe = opts.fe;
        this.things = [];
        this.behaveQueue = require('radiopaque').create().timeAt(opts.fe.simSum);

        this.fof = this.opts.fe.opts.fof;
        this.thingFinder = this.opts.fe.m.b.thingFinder;

        this.directRay = new flame.engine.ray.RayClosestFilterFunction({
            filterFunction: function(thing) {
                if (thing.__instanceId == this.shooterIid) {
                    return true;
                }
            }.bind(this)
        });
    },

    registerMayor: function(mayor) {
        this.mayor = mayor;
        this.scheduleNextStep();
    },

    pushThing: function(thing) {
        thing.horde = this;
        this.things.push(thing);
        this.behaveQueue.pushIn(0, new Behavior(thing, ["think"]));
    },

    removeThing: function(thing) {
        var index = this.things.indexOf(thing);
        if (index >= 0) {
            this.things.splice(index, 1);
        }
    },

    spawn: function(thing) {
        thing.ai = {};
        thing.horde = this;
        thing.l = this.findSpawnPoint(thing);

        this.pushThing(thing);

        this.fe.injectThing(thing);

        this.fe.dispatchTeff(
            thing,
            ["+spawn", "+inert", "+invuln"],
            1,
            ["-spawn", "-inert", "-invuln"]
        );

    },

    scheduleNextStep: function() {
        if (this.opts.plan.stepPeriod) {
            this.mayor.hordeQueue.pushIn(this.opts.plan.stepPeriod, this);
        }
    },

    step: function(event) {
    },

    /**
     * @param  {Thing} thing      subject thing
     * @param  {Component}        turretComponent
     * @param  {int} angle        delta angle we want to rotate
     * @param  {float} minPeriod  minimal time until rotation should be complete (normally AI step period)
     * @return {boolen} if any decision was made
     */
    rotateTurret: function(thing, turretComponent, angle, minPeriod) {
        var turretThing = turretComponent.thing,
            newO = geo.sign(angle) * turretComponent.params.omegaRad,
            idealO = minPeriod ? (angle / minPeriod) : 0.0;

        if (idealO && Math.abs(newO) > Math.abs(idealO)) {
            newO = idealO;
        }

        if (newO != turretThing.o) {
            turretThing.o = newO;
            var event = {
                type: "controlRover",
                thing: thing,
            };
            event[turretComponent.role] = turretThing;
            this.fe.fd.dispatch(event);
        }
    },

    isWorthyEnemy: function(thing, objThing) {
        if (objThing.removed || objThing.hasEffect('invuln')) {
            return false;
        }

        var relation = this.fof.getRelation(thing, objThing);

        return (relation == FriendOrFoe.FOE);
    },

    checkFireLine: function(thing, turretComponent) {
        var range = turretComponent.params.range,
            turretThing = turretComponent.thing;

        this.fe.m.b.rayCastFromThing(this.directRay, turretThing, range, turretComponent.opts.radius);
        if (this.directRay.isHit) {

            var objThing = this.directRay.results[0].thing;

            if (!this.isWorthyEnemy(thing, objThing)) {
                return false;
            }

            this.fe.m.shooter.attemptShoot(thing, turretComponent);
            if (thing.ai.target == objThing) {
                this.rotateTurret(thing, turretComponent, 0);
            }
            return true;
        }

        return false;
    },

    detectEnemy: function(thing, turretComponent) {
        var range = thing.c.radar.params.range;

        bottomLeft.Set(thing.l.x - range, thing.l.y - range);
        topRight.Set(thing.l.x + range, thing.l.y + range);

        var things = this.thingFinder.findAllThingsInAreaDirty(bottomLeft, topRight);

        for (var i = 0; i < things.length; i++) {
            var objThing = things[i];

            if (this.isWorthyEnemy(thing, objThing)) {
                return objThing;
            }
        }

        return null;
    },

    rotateTurretToEnemy: function(thing, turretComponent, minPeriod) {
        if (!thing.c || !thing.c.radar) {
            return false;
        }

        var range = thing.c.radar.params.range;

        // if the target is out of radar range,
        // or is not interesting for me any more (e.g. is dead)
        // then loose this tartget and seek a new one
        if (thing.ai.target) {
            if (this.isWorthyEnemy(thing, thing.ai.target)) {
                var distSQ = cc.pDistanceSQ(thing.l, thing.ai.target.l);
                if (distSQ > range * range) {
                    thing.ai.target = null;
                }
            } else {
                thing.ai.target = null;
            }
        }

        if (!thing.ai.target) {
            thing.ai.target = this.detectEnemy(thing, turretComponent);
            if (!thing.ai.target) {
                return false;
            }
        }

        var targetThing = thing.ai.target,
            turretThing = turretComponent.thing,
            targetAngle = geo.segment2Angle(turretThing.l, targetThing.l),
            closestRotation = geo.closestRotation(turretThing.a, targetAngle);

        if (Math.abs(closestRotation) > Cospeak.readAngle(thing.c.radar.params.lockDa)) {
            this.rotateTurret(thing, turretComponent, closestRotation, minPeriod);
        } else {
            this.rotateTurret(thing, turretComponent, 0);
        }

        return true;
    },
});

module.exports = HordeAbstract;
