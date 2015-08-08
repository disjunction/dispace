/**
 * possible behavior actions:
 * * think
 * * [["i", [...]]] // can be applied to interstate with setArray
 */

function Behavior(thing, actions) {
    this.thing = thing;
    this.actions = actions;
}

/**
 * Each call is an array [delay, [states]]
 */
Behavior.pushInterstateStreak = function(queue, startTime, thing, calls, addThink) {
    var time = startTime;
    for (var i = 0; i < calls.length; i++) {
        var call = calls[i];
        queue.pushAt(time, new Behavior(thing, [["i", call[1]]]));
        time += call[0];
    }
    if (addThink) {
        queue.pushAt(time, new Behavior(thing, ["think"]));
    }
};

module.exports = Behavior;
