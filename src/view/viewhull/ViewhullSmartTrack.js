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
        var trackthing = thing.things[trackName] = this.opts.fe.opts.thingBuilder.makeThingByPlan(plan);

        // rotation relative to hull
        trackthing.a = 0;
        trackthing.aa = 0;

        if (thing.vicinity) {
            trackthing.vicinity = thing.vicinity;
            trackthing.vicinity.things.push(trackthing);
        }
    },

    onEnvision: function(thing) {
        this.addTrack(thing, 'leftTrack', thing.plan.viewhull.leftTrack);
        this.addTrack(thing, 'rightTrack', thing.plan.viewhull.rightTrack);

        // force put subthings in place, to prevent first frame from rendering wrong
        this.opts.fe.m.de.stepAwakeRover(thing, 0);
    },

    applyInterstate: function(newI, thing) {
        if (!thing.things.leftTrack || !thing.things.leftTrack) {
            return;
        }
        var plan = thing.plan,
            modCocos = this.opts.fe.m.c;
        var map = newI.map;
        switch (true) {
            case map[rofCore.DECELERATE] && thing.stateName != 'driveBackward':
                modCocos.changeLook(thing.things.leftTrack, 'backward', true);
                modCocos.changeLook(thing.things.rightTrack, 'backward', true);
                break;

            case map[rofCore.TURN_RIGHT] && ! map[rofCore.ACCELERATE]:
                modCocos.changeLook(thing.things.leftTrack, 'forward', true);
                modCocos.changeLook(thing.things.rightTrack, 'backward', true);
                break;

            case map[rofCore.TURN_LEFT] && ! map[rofCore.ACCELERATE]:
                modCocos.changeLook(thing.things.leftTrack, 'backward', true);
                modCocos.changeLook(thing.things.rightTrack, 'forward', true);
                break;

            case (
                     map[rofCore.ACCELERATE] ||
                     map[rofCore.TURN_LEFT] ||
                     map[rofCore.TURN_RIGHT]
                ):
                modCocos.changeLook(thing.things.leftTrack, 'forward', true);
                modCocos.changeLook(thing.things.rightTrack, 'forward', true);
                break;

            case !(
                     map[rofCore.ACCELERATE] ||
                     map[rofCore.TURN_LEFT] ||
                     map[rofCore.TURN_RIGHT] ||
                     map[rofCore.DECELERATE]
                ):
                modCocos.changeLook(thing.things.leftTrack, 'stop', true);
                modCocos.changeLook(thing.things.rightTrack, 'stop', true);
                break;
        }
    }

});

module.exports = ViewhullSmartTrack;
