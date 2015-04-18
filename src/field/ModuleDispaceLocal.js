var b2 = require('jsbox2d'),
    flame = require('fgtk/flame'),
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract');

/**
 * opts:
 * * viewport
 * * stateBuilder
 * * config
 */
var ModuleDispaceLocal = ModuleAbstract.extend({
    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);

        this.fe.fd.addListener('injectThing', function(event) {
            var thing = event.extra.thing;
            if (thing.type && thing.type == 'rover') {
                this.envisionRover(thing)
            }
        }.bind(this));
        
        this.fe.fd.addListener('moveThing', function(event) {
            var thing = event.thing;
            if (thing.type && thing.type == 'rover') {
                this.moveRover(thing)
            }
        }.bind(this));
    },

    envisionRover: function(thing) {
        var turret = new flame.entity.Thing({
            plan: this.fe.opts.cosmosManager.getResource('thing/rover/hull/faf-minitank'),
            l: thing.l
        });
        thing.items = {};
        thing.items.turret = turret;
        this.fe.m.c.envision(turret);
    },
    
    moveRover: function(thing) {
        var turret = thing.items.turret;
        turret.l = thing.l;
        turret.a = thing.a;
        this.fe.m.c.syncStateFromThing(turret);
    }
});

module.exports = ModuleDispaceLocal;