var b2 = require('jsbox2d'),
    flame = require('fgtk/flame');

module.exports = function(fe) {
    var ppm = fe.opts.config.ppm;
    
    fe.m.localDispace = {};
    
    fe.envisionRover = function(thing) {
        console.log('adding rover');
        var turret = new flame.entity.Thing({
            plan: fe.opts.cosmosManager.getResource('thing/rover/hull/faf-minitank'),
            l: thing.l
        })
        fe.envision(turret);
    };
    
    fe.fd.addListener('onInjectThing', function(event) {
        var thing = event.extra.thing;
        if (thing.type || thing.type == 'rover') {
            this.envisionRover(thing)
        }
    }.bind(fe));
    
    fe.fd.addListener('step', function(event) {
    
    }.bind(fe));
};