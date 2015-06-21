var cc = require('cc'),
    flame = require('fgtk/flame'),
    ViewhullAbstract = require('./ViewhullAbstract'),
    rofCore = require('fgtk/flame/rof/core'),
    Thing = flame.entity.Thing;

var ViewhullTrack = ViewhullAbstract.extend({
    applyInterstate: function(newI, thing) {
        var plan = thing.plan,
            modCocos = this.opts.fe.m.c;
        var map = newI.map;
        switch (true) {
            case map[rofCore.DECELERATE] && thing.stateName != 'driveBackward':
                modCocos.changeState(thing, 'driveBackward');
                break;
            case (thing.stateName != 'driveForward' &&
                 (
                     map[rofCore.ACCELERATE] ||
                     map[rofCore.TURN_LEFT] ||
                     map[rofCore.TURN_RIGHT]
                )):
                modCocos.changeState(thing, 'driveForward');
                break;
            case (thing.stateName != 'stop' &&
                 !(
                     map[rofCore.ACCELERATE] ||
                     map[rofCore.TURN_LEFT] ||
                     map[rofCore.TURN_RIGHT] ||
                     map[rofCore.DECELERATE]
                )):
                modCocos.changeState(thing, 'stop');
                break;
        }
    }
});

module.exports = ViewhullTrack;
