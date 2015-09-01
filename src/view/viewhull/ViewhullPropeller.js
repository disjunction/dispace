var cc = require('cc'),
    flame = require('fgtk/flame'),
    ViewhullAbstract = require('./ViewhullAbstract'),
    rofCore = require('fgtk/flame/rof/core'),
    Thing = flame.entity.Thing;

var ViewhullPropeller = ViewhullAbstract.extend({
    applyInterstate: function(newI, thing) {
        var plan = thing.plan,
            modCocos = this.opts.fe.m.c;

        var map = newI.map;

        switch (true) {
            case map[rofCore.TURN_LEFT]:
                if (thing.stateName != 'driveLeft') {
                    modCocos.changeLook(thing, 'driveLeft');
                }
                break;

            case map[rofCore.TURN_RIGHT]:
                if (thing.stateName != 'driveRight') {
                    modCocos.changeLook(thing, 'driveRight');
                }
                break;

            case (thing.stateName != 'driveForward' &&
                 (
                     map[rofCore.ACCELERATE] ||
                     map[rofCore.DECELERATE]
                )):
                modCocos.changeLook(thing, 'driveForward');
                break;

            case (thing.stateName != 'stop' &&
                 !(
                     map[rofCore.ACCELERATE] ||
                     map[rofCore.TURN_LEFT]  ||
                     map[rofCore.TURN_RIGHT] ||
                     map[rofCore.DECELERATE]
                )):
                modCocos.changeLook(thing, 'stop');
                break;
        }
    }
});

module.exports = ViewhullPropeller;
