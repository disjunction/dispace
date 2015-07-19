/*jslint node: true */
"use strict";

var cc = require('cc'),
    flame = require('fgtk/flame'),
    AbstractSerializer = flame.service.serialize.AbstractSerializer;

var ShotSerializer = AbstractSerializer.extend({
    ctor: function(opts) {
        AbstractSerializer.prototype.ctor.call(this, opts);
    },

    /**
     * see ModuleShooter for details about shot event
     *
     * event:
     * 0: isHit: boolean
     * 1: l1: point
     * 2: l2: point
     * 3: subjComponent: component,
     * 4: subjThing: thing
     * 5: fraction: float
     * 6: subjEnergy: int
     */
    serializeShot: function(event) {
        var o = event.shot;
        return [
            o.isHit,
            [this.outCoord(o.l1.x), this.outCoord(o.l1.y)],
            [this.outCoord(o.l2.x), this.outCoord(o.l2.y)],
            o.subjComponent.role,
            o.subjThing.id,
            this.outFloat(o.fraction),
            o.subjThing.g.e[0],
        ];
    },

    /**
     * * * 2: subEnergy         // full amount energy left after shot
     * @param  {[type]} serial [description]
     * @return {[type]}        [description]
     */
    unserializeShot: function(serial) {
        var subjThing = this.opts.fe.thingMap[serial[4]];
        if (!subjThing) {
            return null;
        }

        var subjComponent = subjThing.c[serial[3]];
        if (!subjComponent) {
            return null;
        }

        return {
            isHit: serial[0],
            l1: cc.p(serial[1][0], serial[1][1]),
            l2: cc.p(serial[2][0], serial[2][1]),
            subjComponent: subjComponent,
            subjThing: subjThing,
            fraction: serial[5],
            subjEnergy: serial[6],
        };
    },

    /**
     * event:
     * * l: endPoint
     * * damage: {a: 10, s: 3, ... }
     * * subjComponent: component
     * * subjThing: thing
     * * objThing: thing
     * * isKill: boolean
     * * teff: [effects]
     *
     * returns:
     * * 0: [x, y]            // l
     * * 1: [damage...]       // full
     * * 2: subComponentRole
     * * 3: subThingId
     * * 4: objThingId
     * * 5: isKill
     *
     * teff is omitted, because it is fired as a separate event
     */
    serializeHit: function(event) {
        var o = event.hit;
        return [
            [this.outCoord(o.l.x), this.outCoord(o.l.y)],
            o.damage,
            o.subjComponent.role,
            o.subjThing.id,
            o.objThing.id,
            o.isKill || false
        ];
    },

    /**
     * see ::serializeHit() for conversion explanation
     */
    unserializeHit: function(serial) {
        var subjThing = this.opts.fe.thingMap[serial[3]] || null,
            objThing = this.opts.fe.thingMap[serial[4]] || null,
            subjComponent = null;

        if (subjThing) {
            subjComponent = subjThing.c[serial[2]];
        }

        return {
            l: cc.p(this.outCoord(serial[0][0]), this.outCoord(serial[0][1])),
            damage: serial[1],
            subjComponent: subjComponent,
            subjThing: subjThing,
            objThing: objThing,
            isKill: serial[5]
        };
    },
});

module.exports = ShotSerializer;
