var cc = require('cc'),
    flame = require('fgtk/flame'),
    ViewhullAbstract = require('./ViewhullAbstract'),
    rofCore = require('fgtk/flame/rof/core'),
    Thing = flame.entity.Thing,
    smog = require('fgtk/smog'),
    Cospeak = smog.Cospeak;

var ViewhullSmartTrack = ViewhullAbstract.extend({

    addTrack: function(thing, trackName, trackDef) {
        var plan = cc.clone(this.cosmosManager.get(trackDef.planSrc));
        thing.things[trackName] = this.opts.fe.opts.thingBuilder.makeThingByPlan(plan);

        // rotation relative to hull
        thing.things[trackName].a = 0;
        thing.things[trackName].aa = 0;
    },

    onEnvision: function(thing) {
        this.addTrack(thing, 'leftTrack', thing.plan.viewhull.leftTrack);
        this.addTrack(thing, 'rightTrack', thing.plan.viewhull.rightTrack);
    },

    applyInterstate: function(newI, thing) {
        var plan = thing.plan,
            modCocos = this.opts.fe.m.c;
        var map = newI.map;
        switch (true) {
            case map[rofCore.DECELERATE] && thing.stateName != 'driveBackward':
                modCocos.changeState(thing.things.leftTrack, 'backward', true);
                modCocos.changeState(thing.things.rightTrack, 'backward', true);
                break;

            case map[rofCore.TURN_RIGHT] && ! map[rofCore.ACCELERATE]:
                modCocos.changeState(thing.things.leftTrack, 'forward', true);
                modCocos.changeState(thing.things.rightTrack, 'backward', true);
                break;

            case map[rofCore.TURN_LEFT] && ! map[rofCore.ACCELERATE]:
                modCocos.changeState(thing.things.leftTrack, 'backward', true);
                modCocos.changeState(thing.things.rightTrack, 'forward', true);
                break;

            case (
                     map[rofCore.ACCELERATE] ||
                     map[rofCore.TURN_LEFT] ||
                     map[rofCore.TURN_RIGHT]
                ):
                modCocos.changeState(thing.things.leftTrack, 'forward', true);
                modCocos.changeState(thing.things.rightTrack, 'forward', true);
                break;

            case !(
                     map[rofCore.ACCELERATE] ||
                     map[rofCore.TURN_LEFT] ||
                     map[rofCore.TURN_RIGHT] ||
                     map[rofCore.DECELERATE]
                ):
                modCocos.changeState(thing.things.leftTrack, 'stop', true);
                modCocos.changeState(thing.things.rightTrack, 'stop', true);
                break;
        }
    }

});

module.exports = ViewhullSmartTrack;
