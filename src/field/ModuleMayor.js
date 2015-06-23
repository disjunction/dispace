/*jslint node: true */
"use strict";

var cc = require('cc'),
    ModuleAbstract = require('fgtk/flame/engine/ModuleAbstract'),
    RoverHordeRandom = require('dispace/ai/mayor/RoverHordeRandom');

/**
 * should be added somewhere in the end of init
 */
var ModuleMayor = ModuleAbstract.extend({
    injectFe: function(fe, name) {
        ModuleAbstract.prototype.injectFe.call(this, fe, name);
        this.horde = new RoverHordeRandom({
            fe: fe
        });

        this.fe.fd.addListener('injectThing', function(event) {
            var thing = event.thing;
            if (thing.type == 'rover' && !thing.player) {
                this.horde.push(event.thing);
            }
        }.bind(this));

        this.fe.fd.addListener('simStepEnd', function(event) {
            this.horde.randomizeInterstate();
        }.bind(this));

        this.fe.fd.addListener('removeThing', function(event) {
            this.horde.removeThing(event.thing);
        }.bind(this));
    }
});

module.exports = ModuleMayor;
