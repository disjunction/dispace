var cc = require('cc'),
    flame = require('fgtk/flame'),
    ViewhullAbstract = require('./ViewhullAbstract'),
    rofCore = require('fgtk/flame/rof/core'),
    Thing = flame.entity.Thing;

var ViewhullPropeller = ViewhullAbstract.extend({
    applyInterstate: function(newI, thing) {
        var plan = thing.plan,
            modCocos = this.opts.fe.m.c;
        switch (true) {
            case thing.stateName != 'driveLeft' && newI[rofCore.TURN_LEFT] == 1:
                modCocos.changeState(thing, 'driveLeft');
                break;

            case thing.stateName != 'driveRight' && newI[rofCore.TURN_RIGHT] == 1:
                modCocos.changeState(thing, 'driveRight');
                break;

            case (thing.stateName != 'driveForward' &&
                 (
                     newI[rofCore.ACCELERATE] == 1||
                     newI[rofCore.DECELERATE]  == 1
                )):
                modCocos.changeState(thing, 'driveForward');
                break;

            case (thing.stateName != 'stop' &&
                 !(
                     newI[rofCore.ACCELERATE] == 1||
                     newI[rofCore.TURN_LEFT]  == 1||
                     newI[rofCore.TURN_RIGHT] == 1 ||
                     newI[rofCore.DECELERATE] == 1
                )):
                modCocos.changeState(thing, 'stop');
                break;
        }
    }
});

module.exports = ViewhullPropeller;